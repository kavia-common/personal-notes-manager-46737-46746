import type { Note } from "~/services/notes.server";

type Props = {
  note: Note;
  onEdit: (n: Note) => void;
  onDelete: (id: string) => void;
  tabIndex?: number;
};

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const min = 60 * 1000;
  const hr = 60 * min;
  const day = 24 * hr;
  if (diff < min) return "just now";
  if (diff < hr) return `${Math.floor(diff / min)}m ago`;
  if (diff < day) return `${Math.floor(diff / hr)}h ago`;
  return `${Math.floor(diff / day)}d ago`;
}

export default function NoteCard({ note, onEdit, onDelete, tabIndex }: Props) {
  return (
    <article
      className="card p-4 flex flex-col gap-3"
      tabIndex={tabIndex}
      aria-label={`Note titled ${note.title}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 line-clamp-1">
          {note.title || "Untitled"}
        </h3>
        <div className="flex items-center gap-1">
          <button
            className="btn"
            onClick={() => onEdit(note)}
            aria-label={`Edit note ${note.title}`}
          >
            Edit
          </button>
          <button
            className="btn btn-danger"
            onClick={() => onDelete(note.id)}
            aria-label={`Delete note ${note.title}`}
          >
            Delete
          </button>
        </div>
      </div>
      {note.content ? (
        <p className="text-sm text-gray-600 line-clamp-3">{note.content}</p>
      ) : (
        <p className="text-sm text-gray-400 italic">No content</p>
      )}
      <div className="mt-auto flex items-center justify-between">
        <span className="badge" aria-label={`Updated ${timeAgo(note.updatedAt)}`}>
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm.75 4.75a.75.75 0 00-1.5 0v3.5c0 .199.079.39.22.53l2.5 2.5a.75.75 0 101.06-1.06l-2.28-2.28V6.75z" />
          </svg>
          {timeAgo(note.updatedAt)}
        </span>
      </div>
    </article>
  );
}
