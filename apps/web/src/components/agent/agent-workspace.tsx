"use client";

import { useState, useEffect } from "react";
import { RichTextEditor } from "./editor/rich-text-editor";
import { ChatPanel } from "./chat/chat-panel";
import { Sidebar } from "./sidebar/sidebar";

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
  projects?: Project;
}

interface Draft {
  id: string;
  title: string;
  content: unknown;
  word_count: number;
  updated_at: string;
}

interface AgentWorkspaceProps {
  projects: Project[];
}

export function AgentWorkspace({ projects }: AgentWorkspaceProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [currentDraft, setCurrentDraft] = useState<Draft | null>(null);
  const [editorContent, setEditorContent] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-select first project if available
  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]);
    }
  }, [projects, selectedProject]);

  // Create or get existing session when project is selected
  useEffect(() => {
    if (selectedProject && !currentSession) {
      fetchOrCreateSession(selectedProject.id);
    }
  }, [selectedProject, currentSession]);

  const fetchOrCreateSession = async (projectId: string) => {
    setIsLoading(true);
    try {
      // Check for existing active session
      const response = await fetch(`/api/agent/sessions?projectId=${projectId}&status=active`);
      const data = await response.json();

      if (data.sessions && data.sessions.length > 0) {
        setCurrentSession(data.sessions[0]);
        // Load latest draft if exists
        const draftsResponse = await fetch(`/api/agent/drafts?projectId=${projectId}&limit=1`);
        const draftsData = await draftsResponse.json();
        if (draftsData.drafts && draftsData.drafts.length > 0) {
          setCurrentDraft(draftsData.drafts[0]);
          setEditorContent(draftsData.drafts[0].content);
        }
      } else {
        // Create new session
        const createResponse = await fetch("/api/agent/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId }),
        });
        const createData = await createResponse.json();
        if (createData.session) {
          setCurrentSession(createData.session);
        }
      }
    } catch (error) {
      console.error("Error fetching/creating session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setCurrentSession(null);
    setCurrentDraft(null);
    setEditorContent(null);
  };

  const handleDraftSelect = (draft: Draft) => {
    setCurrentDraft(draft);
    setEditorContent(draft.content);
  };

  const handleEditorChange = async (content: unknown) => {
    setEditorContent(content);

    // Auto-save draft
    if (currentDraft) {
      try {
        await fetch(`/api/agent/drafts/${currentDraft.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
      } catch (error) {
        console.error("Error saving draft:", error);
      }
    }
  };

  const handleNewDraft = async () => {
    if (!selectedProject || !currentSession) return;

    try {
      const response = await fetch("/api/agent/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject.id,
          sessionId: currentSession.id,
        }),
      });
      const data = await response.json();
      if (data.draft) {
        setCurrentDraft(data.draft);
        setEditorContent(data.draft.content);
      }
    } catch (error) {
      console.error("Error creating draft:", error);
    }
  };

  const handleExport = async () => {
    if (!currentDraft) return;

    try {
      const response = await fetch(`/api/agent/drafts/${currentDraft.id}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedProject?.reference_code || "draft"}_${currentDraft.title || "document"}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error exporting draft:", error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Sidebar - Project Context & Drafts */}
      <div className="w-80 border-r flex-shrink-0">
        <Sidebar
          projects={projects}
          selectedProject={selectedProject}
          currentDraft={currentDraft}
          onProjectSelect={handleProjectSelect}
          onDraftSelect={handleDraftSelect}
          onNewDraft={handleNewDraft}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Editor */}
        <div className="flex-1 flex flex-col border-r">
          <div className="border-b p-3 flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {currentDraft?.title || selectedProject?.topic || "Select a project"}
              </span>
              {currentDraft && (
                <span className="text-xs text-muted-foreground">
                  {currentDraft.word_count} words
                </span>
              )}
            </div>
            <button
              onClick={handleExport}
              disabled={!currentDraft}
              className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export DOCX
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <RichTextEditor
              content={editorContent}
              onChange={handleEditorChange}
              placeholder="Start writing or use the assistant to generate content..."
            />
          </div>
        </div>

        {/* Chat Panel */}
        <div className="w-96 flex-shrink-0">
          <ChatPanel
            session={currentSession}
            project={selectedProject}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
