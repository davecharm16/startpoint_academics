"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { useEffect } from "react";
import { EditorToolbar } from "./toolbar";

interface RichTextEditorProps {
  content: unknown;
  onChange: (content: unknown) => void;
  placeholder?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing...",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Underline,
    ],
    content: content as Parameters<typeof useEditor>[0]["content"],
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose max-w-none focus:outline-none min-h-[500px] p-4",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content) {
      const currentContent = editor.getJSON();
      // Only update if content is different to avoid cursor jumping
      if (JSON.stringify(currentContent) !== JSON.stringify(content)) {
        editor.commands.setContent(
          content as Parameters<typeof editor.commands.setContent>[0]
        );
      }
    }
  }, [editor, content]);

  if (!editor) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-muted rounded mb-4" />
        <div className="h-[500px] bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
