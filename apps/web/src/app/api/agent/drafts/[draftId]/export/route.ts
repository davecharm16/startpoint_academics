import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@startpoint/supabase/server";
import { generateDocx, type ExportOptions } from "@startpoint/ai/export";
import type { Json } from "@startpoint/types/database";

interface RouteContext {
  params: Promise<{ draftId: string }>;
}

// Type for draft data (table may not exist yet in database types)
interface DraftRow {
  id: string;
  title: string;
  content: Json;
  projects: { topic: string; reference_code: string } | null;
  profiles: { full_name: string } | null;
}

// POST /api/agent/drafts/[draftId]/export - Export draft to DOCX
export async function POST(request: NextRequest, context: RouteContext) {
  const { draftId } = await context.params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get export options from body
    let options: ExportOptions = {};
    try {
      const body = await request.json();
      options = {
        title: body.title,
        author: body.author,
        fontSize: body.fontSize,
        lineSpacing: body.lineSpacing,
        includePageNumbers: body.includePageNumbers,
        margins: body.margins,
      };
    } catch {
      // No body or invalid JSON - use defaults
    }

    // Get draft
    const { data: draft, error: draftError } = await supabase
      .from("agent_drafts")
      .select(
        `
        *,
        projects (
          topic,
          reference_code
        ),
        profiles:writer_id (
          full_name
        )
      `
      )
      .eq("id", draftId)
      .eq("writer_id", user.id)
      .single();

    if (draftError || !draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    const typedDraft = draft as unknown as DraftRow;

    // Prepare export options with defaults from draft
    const exportOptions: ExportOptions = {
      title:
        options.title ||
        typedDraft.title ||
        typedDraft.projects?.topic ||
        "Document",
      author:
        options.author || typedDraft.profiles?.full_name || "Startpoint Writer",
      fontSize: options.fontSize || 12,
      lineSpacing: options.lineSpacing || 1.5,
      includePageNumbers: options.includePageNumbers ?? true,
      margins: options.margins || {
        top: 1440,
        bottom: 1440,
        left: 1440,
        right: 1440,
      },
    };

    // Generate DOCX
    const docxBuffer = await generateDocx(
      typedDraft.content as { type: "doc"; content: [] },
      exportOptions
    );

    // Mark draft as exported
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("agent_drafts")
      .update({ is_exported: true, updated_at: new Date().toISOString() })
      .eq("id", draftId);

    // Generate filename
    const filename = sanitizeFilename(
      `${typedDraft.projects?.reference_code || "draft"}_${typedDraft.title || "document"}.docx`
    );

    // Return DOCX file
    return new Response(Buffer.from(docxBuffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": docxBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export draft" },
      { status: 500 }
    );
  }
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/__+/g, "_")
    .substring(0, 200);
}
