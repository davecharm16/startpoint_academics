"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  ChevronRight,
  Folder,
  Clock,
  Gauge,
} from "lucide-react";
import { UsageMeter } from "./usage-meter";

interface Project {
  id: string;
  reference_code: string;
  topic: string;
  status: string;
  requirements?: string;
  deadline?: string;
}

interface Draft {
  id: string;
  title: string;
  content: unknown;
  word_count: number;
  updated_at: string;
}

interface SidebarProps {
  projects: Project[];
  selectedProject: Project | null;
  currentDraft: Draft | null;
  onProjectSelect: (project: Project) => void;
  onDraftSelect: (draft: Draft) => void;
  onNewDraft: () => void;
}

export function Sidebar({
  projects,
  selectedProject,
  currentDraft,
  onProjectSelect,
  onDraftSelect,
  onNewDraft,
}: SidebarProps) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [showUsage, setShowUsage] = useState(false);

  // Load drafts when project changes
  useEffect(() => {
    if (selectedProject) {
      loadDrafts(selectedProject.id);
    } else {
      setDrafts([]);
    }
  }, [selectedProject]);

  const loadDrafts = async (projectId: string) => {
    try {
      const response = await fetch(`/api/agent/drafts?projectId=${projectId}`);
      const data = await response.json();
      if (data.drafts) {
        setDrafts(data.drafts);
      }
    } catch (error) {
      console.error("Error loading drafts:", error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Writing Assistant</h2>
          <button
            onClick={() => setShowUsage(!showUsage)}
            className="p-1.5 rounded hover:bg-muted"
            title="View usage"
          >
            <Gauge className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Usage Meter */}
      {showUsage && (
        <div className="border-b">
          <UsageMeter />
        </div>
      )}

      {/* Projects */}
      <div className="p-3 border-b">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          Projects
        </h3>
        <div className="space-y-1">
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              No assigned projects
            </p>
          ) : (
            projects.map((project) => (
              <button
                key={project.id}
                onClick={() => onProjectSelect(project)}
                className={`w-full flex items-center gap-2 p-2 rounded text-left text-sm transition-colors ${
                  selectedProject?.id === project.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                }`}
              >
                <Folder className="h-4 w-4 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{project.topic}</div>
                  <div className="text-xs text-muted-foreground">
                    {project.reference_code}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 flex-shrink-0 opacity-50" />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Drafts */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Drafts
          </h3>
          <button
            onClick={onNewDraft}
            disabled={!selectedProject}
            className="p-1 rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            title="New draft"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {!selectedProject ? (
          <p className="text-sm text-muted-foreground py-2">
            Select a project first
          </p>
        ) : drafts.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">No drafts yet</p>
            <button
              onClick={onNewDraft}
              className="text-sm text-primary hover:underline"
            >
              Create your first draft
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {drafts.map((draft) => (
              <button
                key={draft.id}
                onClick={() => onDraftSelect(draft)}
                className={`w-full flex items-center gap-2 p-2 rounded text-left text-sm transition-colors ${
                  currentDraft?.id === draft.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                }`}
              >
                <FileText className="h-4 w-4 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{draft.title}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{draft.word_count} words</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(new Date(draft.updated_at))}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Project details */}
      {selectedProject && (
        <div className="p-3 border-t bg-muted/30">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Project Details
          </h3>
          <div className="space-y-1 text-sm">
            <div>
              <span className="text-muted-foreground">Topic: </span>
              <span className="font-medium">{selectedProject.topic}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Status: </span>
              <span className="capitalize">{selectedProject.status.replace("_", " ")}</span>
            </div>
            {selectedProject.deadline && (
              <div>
                <span className="text-muted-foreground">Deadline: </span>
                <span>
                  {new Date(selectedProject.deadline).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
