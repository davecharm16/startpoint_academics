"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "./step-indicator";
import { ProjectDetailsStep } from "./intake-form-steps/project-details";
import { InstructionsStep } from "./intake-form-steps/instructions";
import { ContactInfoStep } from "./intake-form-steps/contact-info";
import { PaymentStep } from "./intake-form-steps/payment-step";
import { ArrowLeft, ArrowRight, Loader2, Send, RotateCcw, X } from "lucide-react";
import { useAutoSave } from "@/hooks/use-auto-save";
import type { Package } from "@/types/database";

// Base form schema
const intakeFormSchema = z.object({
  // Step 1: Project Details
  topic: z.string().min(10, "Topic must be at least 10 characters"),
  deadline: z.string().min(1, "Deadline is required"),
  expected_outputs: z.string().min(20, "Please describe expected outputs (at least 20 characters)"),

  // Step 2: Instructions
  special_instructions: z.string().optional(),
  requirements: z.record(z.string(), z.any()).optional(),

  // Step 3: Contact
  client_name: z.string().min(2, "Name is required"),
  client_email: z.string().email("Please enter a valid email address"),
  client_phone: z
    .string()
    .regex(/^09\d{9}$/, "Please enter a valid Philippine mobile number (09XXXXXXXXX)"),

  // Step 4: Payment (optional fields, validated conditionally)
  amount_paid: z.number().optional(),
  payment_method_id: z.string().optional(),
});

export type IntakeFormData = z.infer<typeof intakeFormSchema>;

interface RequiredField {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "textarea";
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface PaymentSettings {
  id: string;
  downpayment_type: "percentage" | "fixed";
  downpayment_value: number;
  screenshot_required: boolean;
  reference_required: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  account_name: string;
  account_number: string;
  is_enabled: boolean;
  display_order: number;
}

interface IntakeFormProps {
  packageData: Package;
  paymentSettings: PaymentSettings | null;
  paymentMethods: PaymentMethod[];
}

const STEPS = [
  { id: 1, title: "Project", description: "Details" },
  { id: 2, title: "Instructions", description: "Requirements" },
  { id: 3, title: "Contact", description: "Your info" },
  { id: 4, title: "Payment", description: "Confirm" },
];

// Fields required for each step validation
const STEP_FIELDS: Record<number, (keyof IntakeFormData)[]> = {
  1: ["topic", "deadline", "expected_outputs"],
  2: [], // Dynamic validation - handled separately
  3: ["client_name", "client_email", "client_phone"],
  4: [], // Conditional validation
};

export function IntakeForm({
  packageData,
  paymentSettings,
  paymentMethods,
}: IntakeFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [requirementErrors, setRequirementErrors] = useState<Record<string, string>>({});

  // Get required fields from package
  const requiredFields = Array.isArray(packageData.required_fields)
    ? (packageData.required_fields as unknown as RequiredField[])
    : [];

  const methods = useForm<IntakeFormData>({
    resolver: zodResolver(intakeFormSchema),
    mode: "onTouched",
    defaultValues: {
      topic: "",
      deadline: "",
      expected_outputs: "",
      special_instructions: "",
      requirements: {},
      client_name: "",
      client_email: "",
      client_phone: "",
      amount_paid: undefined,
      payment_method_id: undefined,
    },
  });

  const { handleSubmit, trigger, watch, reset } = methods;
  const formValues = watch();

  // Auto-save hook
  const {
    isRestorePromptShown,
    restoreDraft,
    dismissRestorePrompt,
    clearDraft,
  } = useAutoSave<IntakeFormData>({
    key: packageData.slug,
    data: formValues,
    excludeFields: ["amount_paid", "payment_method_id"], // Don't save payment info
    expiryHours: 24,
    debounceMs: 2000,
    onRestore: (savedData) => {
      reset({ ...methods.getValues(), ...savedData });
    },
  });

  // Restore draft handler
  const handleRestoreDraft = () => {
    restoreDraft();
  };

  // Calculate downpayment
  const calculateDownpayment = () => {
    if (!paymentSettings) return 0;
    if (paymentSettings.downpayment_type === "percentage") {
      return (packageData.price * paymentSettings.downpayment_value) / 100;
    }
    return paymentSettings.downpayment_value;
  };

  const downpaymentAmount = calculateDownpayment();

  // Format currency
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Validate current step before proceeding
  const validateStep = async () => {
    const fields = STEP_FIELDS[currentStep];

    // Standard field validation
    if (fields.length > 0) {
      const isValid = await trigger(fields);
      if (!isValid) return false;
    }

    // Step 2: Validate dynamic required fields
    if (currentStep === 2) {
      const requirements = formValues.requirements || {};
      const errors: Record<string, string> = {};

      for (const field of requiredFields) {
        if (field.required) {
          const value = requirements[field.name];
          if (value === undefined || value === null || value === "") {
            errors[field.name] = `${field.label} is required`;
          }
        }
      }

      setRequirementErrors(errors);
      return Object.keys(errors).length === 0;
    }

    return true;
  };

  const handleNext = async () => {
    const isValid = await validateStep();
    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: IntakeFormData) => {
    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("data", JSON.stringify({
        ...data,
        package_id: packageData.id,
        package_slug: packageData.slug,
        agreed_price: packageData.price,
      }));

      if (paymentScreenshot) {
        formData.append("screenshot", paymentScreenshot);
      }

      const response = await fetch("/api/submit-project", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      const result = await response.json();

      // Clear the auto-saved draft
      clearDraft();

      // Redirect to success page
      router.push(`/submit/success?ref=${result.reference_code}&token=${result.tracking_token}`);
    } catch (error) {
      console.error("Submission error:", error);
      // Handle error - could show toast notification
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <Card>
        <CardHeader className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-xl sm:text-2xl">{packageData.name}</CardTitle>
            <span className="text-xl sm:text-2xl font-bold text-primary">
              {formatPrice(packageData.price)}
            </span>
          </div>
          {packageData.description && (
            <p className="text-muted-foreground">{packageData.description}</p>
          )}
        </CardHeader>

        <CardContent className="space-y-6 p-4 sm:p-6 pt-0 sm:pt-0">
          {/* Draft Restore Prompt */}
          {isRestorePromptShown && (
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-muted-foreground/20">
              <div className="flex items-center gap-3">
                <RotateCcw className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">
                  We found a saved draft. Would you like to restore it?
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRestoreDraft}
                >
                  Restore Draft
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={dismissRestorePrompt}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <StepIndicator steps={STEPS} currentStep={currentStep} />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step Content */}
            <div className="min-h-[300px]">
              {currentStep === 1 && <ProjectDetailsStep />}
              {currentStep === 2 && (
                <InstructionsStep
                  requiredFields={requiredFields}
                  errors={requirementErrors}
                />
              )}
              {currentStep === 3 && <ContactInfoStep />}
              {currentStep === 4 && (
                <PaymentStep
                  downpaymentAmount={downpaymentAmount}
                  paymentSettings={paymentSettings}
                  paymentMethods={paymentMethods}
                  onScreenshotChange={setPaymentScreenshot}
                  formatPrice={formatPrice}
                />
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              {currentStep < 4 ? (
                <Button type="button" onClick={handleNext}>
                  <span className="hidden sm:inline">Next</span>
                  <ArrowRight className="h-4 w-4 sm:ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin sm:mr-2" />
                      <span className="hidden sm:inline">Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Submit Request</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  );
}
