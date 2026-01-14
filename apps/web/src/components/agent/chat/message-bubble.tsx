"use client";

import { User, Bot, Loader2, Globe, BookOpen, FileText } from "lucide-react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  toolUse?: {
    name: string;
    result?: unknown;
    isLoading?: boolean;
  };
}

interface MessageBubbleProps {
  message: Message;
}

const toolIcons: Record<string, typeof Globe> = {
  web_search: Globe,
  scrape_url: FileText,
  search_academic: BookOpen,
  read_file: FileText,
  format_citation: FileText,
  write_to_draft: FileText,
  analyze_writing: FileText,
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const ToolIcon = message.toolUse
    ? toolIcons[message.toolUse.name] || FileText
    : null;

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}

      <div
        className={`max-w-[85%] ${
          isUser
            ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
            : "bg-muted rounded-2xl rounded-tl-sm"
        } px-4 py-2`}
      >
        {message.toolUse && (
          <div className="flex items-center gap-2 mb-2 text-xs opacity-75">
            {message.toolUse.isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              ToolIcon && <ToolIcon className="h-3 w-3" />
            )}
            <span className="capitalize">
              {formatToolName(message.toolUse.name)}
              {message.toolUse.isLoading ? "..." : ""}
            </span>
          </div>
        )}

        <div className="text-sm whitespace-pre-wrap break-words">
          {message.content || (
            <span className="italic opacity-70">
              {message.toolUse?.isLoading
                ? "Working..."
                : "Processing response..."}
            </span>
          )}
        </div>

        {message.toolUse?.result !== undefined &&
          message.toolUse?.result !== null &&
          !message.toolUse.isLoading ? (
            <ToolResultPreview result={message.toolUse.result} />
          ) : null}

        <div
          className={`text-[10px] mt-1 ${
            isUser ? "text-primary-foreground/70" : "text-muted-foreground"
          }`}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}

function formatToolName(name: string): string {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function ToolResultPreview({ result }: { result: unknown }) {
  if (!result || typeof result !== "object") return null;

  const data = result as Record<string, unknown>;

  // Web search results
  if (data.results && Array.isArray(data.results)) {
    const results = data.results.slice(0, 3);
    return (
      <div className="mt-2 space-y-1 text-xs bg-background/50 rounded p-2">
        {results.map((r: { title: string; url: string }, i: number) => (
          <div key={i} className="truncate">
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {r.title}
            </a>
          </div>
        ))}
        {(data.results as unknown[]).length > 3 && (
          <div className="text-muted-foreground">
            +{(data.results as unknown[]).length - 3} more results
          </div>
        )}
      </div>
    );
  }

  // Citation result
  if (data.citation && typeof data.citation === "string") {
    return (
      <div className="mt-2 text-xs bg-background/50 rounded p-2 italic">
        {data.citation as string}
      </div>
    );
  }

  // Word count from write_to_draft
  if (data.wordCount !== undefined) {
    return (
      <div className="mt-2 text-xs text-muted-foreground">
        Added {data.wordCount as number} words to draft
      </div>
    );
  }

  // Academic search
  if (data.papers && Array.isArray(data.papers)) {
    const papers = data.papers.slice(0, 2);
    return (
      <div className="mt-2 space-y-1 text-xs bg-background/50 rounded p-2">
        {papers.map(
          (p: { title: string; authors?: string[]; year?: number }, i: number) => (
            <div key={i} className="truncate">
              <span className="font-medium">{p.title}</span>
              {p.authors && p.year && (
                <span className="text-muted-foreground">
                  {" "}
                  ({p.authors[0]?.split(" ").pop()}, {p.year})
                </span>
              )}
            </div>
          )
        )}
      </div>
    );
  }

  return null;
}
