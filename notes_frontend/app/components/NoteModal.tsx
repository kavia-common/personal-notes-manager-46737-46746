import React, { useEffect, useRef, useState } from "react";
import type { Note } from "~/services/notes.server";

type Props = {
  open: boolean;
  initial?: Partial<Note>;
  onClose: () => void;
  onSubmit: (data: { id?: string; title: string; content?: string }) => void;
};

export default function NoteModal({ open, initial, onClose, onSubmit }: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? "");
      setContent(initial?.content ?? "");
      setError(null);
      // focus title on open
      setTimeout(() => titleRef.current?.focus(), 0);
    }
  }, [open, initial?.title, initial?.content]);

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        onClose();
      }
    }
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) {
      setError("Title is required.");
      titleRef.current?.focus();
      return;
    }
    if (t.length > 120) {
      setError("Title must be at most 120 characters.");
      return;
    }
    if (content && content.length > 5000) {
      setError("Content must be at most 5000 characters.");
      return;
    }
    onSubmit({ id: initial?.id, title: t, content });
  }

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      role="button"
      tabIndex={0}
      aria-label="Close modal by clicking on the backdrop or pressing Escape"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
        if (e.key === "Enter" && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="modal p-5"
        role="document"
      >
        <div className="flex items-start justify-between">
          <h2 id="note-modal-title" className="text-xl font-semibold">
            {initial?.id ? "Edit note" : "New note"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="btn"
          >
            Close
          </button>
        </div>
        <form className="mt-4 flex flex-col gap-3" onSubmit={handleSubmit}>
          <label className="text-sm font-medium">
            Title
            <input
              ref={titleRef}
              className="input mt-1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={120}
              aria-invalid={!!error && title.trim().length === 0}
            />
          </label>
          <label className="text-sm font-medium">
            Content
            <textarea
              className="textarea mt-1 min-h-[140px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={5000}
            />
          </label>
          {error ? (
            <div
              role="alert"
              className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2"
            >
              {error}
            </div>
          ) : null}
          <div className="mt-1 flex items-center justify-end gap-2">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {initial?.id ? "Save changes" : "Create note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
