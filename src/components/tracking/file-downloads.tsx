"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Download,
  File,
  FileText,
  Image,
  FileSpreadsheet,
  FileArchive,
  Loader2,
} from "lucide-react";

interface FileRecord {
  id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  created_at: string;
}

interface FileDownloadsProps {
  trackingToken: string;
  projectStatus: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getFileIcon = (type: string) => {
  if (type.startsWith("image/")) return Image;
  if (type.includes("spreadsheet") || type.includes("excel")) return FileSpreadsheet;
  if (type.includes("zip") || type.includes("rar")) return FileArchive;
  if (type.includes("pdf") || type.includes("word") || type.includes("document")) return FileText;
  return File;
};

export function FileDownloads({ trackingToken, projectStatus }: FileDownloadsProps) {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isComplete = ["complete", "paid"].includes(projectStatus);

  useEffect(() => {
    if (!isComplete) {
      setIsLoading(false);
      return;
    }

    async function fetchFiles() {
      try {
        const response = await fetch(`/api/track/${trackingToken}/files`);
        if (!response.ok) {
          if (response.status === 401) {
            // PIN verification required - should not show files
            setFiles([]);
            return;
          }
          throw new Error("Failed to fetch files");
        }
        const data = await response.json();
        setFiles(data);
      } catch (err) {
        console.error("Fetch files error:", err);
        setError("Unable to load files");
      } finally {
        setIsLoading(false);
      }
    }

    fetchFiles();
  }, [trackingToken, isComplete]);

  const handleDownload = async (fileId: string) => {
    setDownloadingId(fileId);
    try {
      const response = await fetch(`/api/track/${trackingToken}/files/${fileId}`);
      if (!response.ok) {
        throw new Error("Download failed");
      }
      const data = await response.json();
      window.open(data.url, "_blank");
    } catch {
      setError("Download failed. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  // Don't show anything if project is not complete
  if (!isComplete) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Your Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Your Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (files.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Your Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Files will be available here once uploaded by your writer.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Download className="h-5 w-5" />
          Your Files Are Ready!
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {files.map((file) => {
            const FileIcon = getFileIcon(file.file_type);
            return (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border"
              >
                <FileIcon className="h-8 w-8 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.file_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.file_size)}
                  </p>
                </div>
                <Button
                  onClick={() => handleDownload(file.id)}
                  disabled={downloadingId === file.id}
                  size="sm"
                >
                  {downloadingId === file.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
