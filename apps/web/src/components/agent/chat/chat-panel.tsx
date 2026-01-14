"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, AlertCircle } from "lucide-react";
import { MessageBubble, type Message } from "./message-bubble";

interface Project {
  id: string;
  reference_code: string;
  topic: string;
  status: string;
  requirements?: string;
  deadline?: string;
}

interface Session {
  id: string;
  title: string;
  status: string;
  project_id: string;
}

interface ChatPanelProps {
  session: Session | null;
  project: Project | null;
  isLoading: boolean;
}

export function ChatPanel({ session, project, isLoading }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load existing messages when session changes
  useEffect(() => {
    if (session) {
      loadMessages(session.id);
    } else {
      setMessages([]);
    }
  }, [session]);

  const loadMessages = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/agent/sessions/${sessionId}`);
      const data = await response.json();
      if (data.session?.agent_messages) {
        setMessages(
          data.session.agent_messages.map(
            (m: {
              id: string;
              role: string;
              content: string;
              tool_name?: string;
              tool_result?: unknown;
              created_at: string;
            }) => ({
              id: m.id,
              role: m.role as "user" | "assistant",
              content: m.content,
              toolUse: m.tool_name
                ? { name: m.tool_name, result: m.tool_result }
                : undefined,
              timestamp: new Date(m.created_at),
            })
          )
        );
      }
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !session || isSending) return;

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError(null);
    setIsSending(true);

    try {
      const response = await fetch(
        `/api/agent/sessions/${session.id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage.content }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      // Handle SSE stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;

            try {
              const event = JSON.parse(data);
              if (event.type === "text") {
                assistantMessage = {
                  ...assistantMessage,
                  content: assistantMessage.content + event.text,
                };
                setMessages((prev) => [
                  ...prev.slice(0, -1),
                  assistantMessage,
                ]);
              } else if (event.type === "tool_use_start") {
                assistantMessage = {
                  ...assistantMessage,
                  toolUse: { name: event.name, isLoading: true },
                };
                setMessages((prev) => [
                  ...prev.slice(0, -1),
                  assistantMessage,
                ]);
              } else if (event.type === "tool_use_end") {
                assistantMessage = {
                  ...assistantMessage,
                  toolUse: {
                    name: event.name,
                    result: event.result,
                    isLoading: false,
                  },
                };
                setMessages((prev) => [
                  ...prev.slice(0, -1),
                  assistantMessage,
                ]);
              } else if (event.type === "error") {
                setError(event.error);
              } else if (event.type === "blocked") {
                setError(event.reason);
              }
            } catch {
              // Ignore parse errors for incomplete JSON
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!session) {
    return (
      <div className="h-full flex items-center justify-center p-4 text-center text-muted-foreground">
        <div>
          <p className="mb-2">Select a project to start writing</p>
          <p className="text-sm">
            The AI assistant will help you with research, writing, and citations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-muted/20">
      {/* Header */}
      <div className="p-3 border-b bg-background">
        <h2 className="font-medium">Writing Assistant</h2>
        {project && (
          <p className="text-xs text-muted-foreground truncate">
            {project.topic}
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p className="mb-2">Start a conversation</p>
            <p className="text-sm">
              Ask for help with research, writing, or citations.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t bg-background">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask for help with writing..."
            disabled={isSending}
            rows={2}
            className="flex-1 resize-none rounded-md border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="self-end px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
