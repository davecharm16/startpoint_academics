"use client";

import { useEffect, useCallback, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

interface Draft<T> {
  data: T;
  timestamp: number;
}

interface UseAutoSaveOptions<T> {
  key: string;
  data: T;
  excludeFields?: (keyof T)[];
  expiryHours?: number;
  debounceMs?: number;
  onRestore?: (data: Partial<T>) => void;
}

export function useAutoSave<T extends Record<string, unknown>>({
  key,
  data,
  excludeFields = [],
  expiryHours = 24,
  debounceMs = 2000,
  onRestore,
}: UseAutoSaveOptions<T>) {
  const [hasDraft, setHasDraft] = useState(false);
  const [isRestorePromptShown, setIsRestorePromptShown] = useState(false);

  const STORAGE_KEY = `intake_draft_${key}`;

  // Check for existing draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft) {
      try {
        const draft: Draft<T> = JSON.parse(savedDraft);
        const hoursOld =
          (Date.now() - draft.timestamp) / (1000 * 60 * 60);

        if (hoursOld > expiryHours) {
          // Draft expired, remove it
          localStorage.removeItem(STORAGE_KEY);
          setHasDraft(false);
        } else {
          setHasDraft(true);
          setIsRestorePromptShown(true);
        }
      } catch {
        // Invalid JSON, remove it
        localStorage.removeItem(STORAGE_KEY);
        setHasDraft(false);
      }
    }
  }, [STORAGE_KEY, expiryHours]);

  // Debounced save function
  const debouncedSave = useDebouncedCallback((dataToSave: T) => {
    // Filter out sensitive fields
    const sanitizedData = Object.entries(dataToSave).reduce(
      (acc, [field, value]) => {
        if (!excludeFields.includes(field as keyof T)) {
          acc[field as keyof T] = value as T[keyof T];
        }
        return acc;
      },
      {} as Partial<T>
    );

    const draft: Draft<Partial<T>> = {
      data: sanitizedData,
      timestamp: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    setHasDraft(true);
  }, debounceMs);

  // Auto-save when data changes
  useEffect(() => {
    if (Object.keys(data).length > 0) {
      debouncedSave(data);
    }
  }, [data, debouncedSave]);

  // Restore draft function
  const restoreDraft = useCallback(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft) {
      try {
        const draft: Draft<Partial<T>> = JSON.parse(savedDraft);
        if (onRestore) {
          onRestore(draft.data);
        }
        setIsRestorePromptShown(false);
        return draft.data;
      } catch {
        return null;
      }
    }
    return null;
  }, [STORAGE_KEY, onRestore]);

  // Dismiss restore prompt without restoring
  const dismissRestorePrompt = useCallback(() => {
    setIsRestorePromptShown(false);
  }, []);

  // Clear draft (call after successful submission)
  const clearDraft = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHasDraft(false);
    setIsRestorePromptShown(false);
  }, [STORAGE_KEY]);

  return {
    hasDraft,
    isRestorePromptShown,
    restoreDraft,
    dismissRestorePrompt,
    clearDraft,
  };
}
