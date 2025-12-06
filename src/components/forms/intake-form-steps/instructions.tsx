"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IntakeFormData } from "../intake-form";

interface RequiredField {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "textarea";
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface InstructionsStepProps {
  requiredFields: RequiredField[];
  errors?: Record<string, string>;
}

export function InstructionsStep({ requiredFields, errors = {} }: InstructionsStepProps) {
  const { register, setValue, watch } = useFormContext<IntakeFormData>();

  const requirements = watch("requirements") || {};

  const handleRequirementChange = (name: string, value: string | number) => {
    setValue("requirements", {
      ...requirements,
      [name]: value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Instructions & Requirements</h3>
        <p className="text-sm text-muted-foreground">
          Provide any specific instructions or requirements for your project.
        </p>
      </div>

      <div className="space-y-4">
        {/* Special Instructions */}
        <div className="space-y-2">
          <Label htmlFor="special_instructions">Special Instructions</Label>
          <Textarea
            id="special_instructions"
            placeholder="Any specific requirements, formatting guidelines, or additional information..."
            rows={4}
            {...register("special_instructions")}
          />
          <p className="text-xs text-muted-foreground">
            Include any professor instructions, formatting requirements, or
            specific sources to reference.
          </p>
        </div>

        {/* Dynamic Package Fields */}
        {requiredFields.length > 0 && (
          <div className="space-y-4 pt-4 border-t">
            <p className="text-sm font-medium">Package-Specific Requirements</p>

            {requiredFields.map((field) => {
              const hasError = !!errors[field.name];
              return (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && (
                      <span className="text-destructive"> *</span>
                    )}
                  </Label>

                  {field.type === "text" && (
                    <Input
                      id={field.name}
                      placeholder={field.placeholder}
                      value={(requirements[field.name] as string) || ""}
                      onChange={(e) =>
                        handleRequirementChange(field.name, e.target.value)
                      }
                      className={hasError ? "border-destructive" : ""}
                    />
                  )}

                  {field.type === "number" && (
                    <Input
                      id={field.name}
                      type="number"
                      placeholder={field.placeholder}
                      value={(requirements[field.name] as number) || ""}
                      onChange={(e) =>
                        handleRequirementChange(
                          field.name,
                          parseInt(e.target.value) || 0
                        )
                      }
                      className={hasError ? "border-destructive" : ""}
                    />
                  )}

                  {field.type === "textarea" && (
                    <Textarea
                      id={field.name}
                      placeholder={field.placeholder}
                      rows={3}
                      value={(requirements[field.name] as string) || ""}
                      onChange={(e) =>
                        handleRequirementChange(field.name, e.target.value)
                      }
                      className={hasError ? "border-destructive" : ""}
                    />
                  )}

                  {field.type === "select" && field.options && (
                    <Select
                      value={(requirements[field.name] as string) || ""}
                      onValueChange={(value) =>
                        handleRequirementChange(field.name, value)
                      }
                    >
                      <SelectTrigger className={hasError ? "border-destructive" : ""}>
                        <SelectValue placeholder={field.placeholder || "Select..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {hasError && (
                    <p className="text-sm text-destructive">{errors[field.name]}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
