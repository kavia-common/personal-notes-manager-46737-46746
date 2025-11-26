import type { Note } from "~/services/notes.server";
import NoteCard from "./NoteCard";

type Props = {
  notes: Note[];
  onEdit: (n: Note) => void;
  onDelete: (id: string) => void;
};

export default function NotesGrid({ notes, onEdit, onDelete }: Props) {
  if (!notes.length) {
    return (
      <div className="rounded-2xl p-10 border border-dashed border-gray-300 text-center bg-white">
        <h2 className="text-lg font-semibold mb-1">No notes yet</h2>
        <p className="text-gray-500">
          Click the New button to create your first note.
        </p>
      </div>
    );
  }
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}
    >
      {notes.map((n) => (
        <NoteCard
          key={n.id}
          note={n}
          onEdit={onEdit}
          onDelete={onDelete}
          tabIndex={0}
        />
      ))}
    </div>
  );
}
