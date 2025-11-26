import type { MetaFunction } from "@remix-run/node";
import { useEffect, useMemo, useState } from "react";
import TopNav from "~/components/TopNav";
import NotesGrid from "~/components/NotesGrid";
import NoteModal from "~/components/NoteModal";
import { getClientNotesService, type Note } from "~/services/notes.client";

export const meta: MetaFunction = () => {
  return [
    { title: "Notes — Ocean Professional" },
    { name: "description", content: "Simple personal notes app." },
  ];
};

export default function Index() {
  const service = useMemo(() => getClientNotesService(), []);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Note | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const list = await service.list();
      setNotes(list);
    } catch {
      setError("Failed to load notes; using local mode if available.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAdd() {
    setEditing(undefined);
    setModalOpen(true);
  }

  function handleEdit(n: Note) {
    setEditing(n);
    setModalOpen(true);
  }

  async function handleDelete(id: string) {
    await service.remove(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  async function handleSubmit(data: { id?: string; title: string; content?: string }) {
    if (data.id) {
      const updated = await service.update({ id: data.id, title: data.title, content: data.content });
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    } else {
      const created = await service.create({ title: data.title, content: data.content });
      setNotes((prev) => [created, ...prev]);
    }
    setModalOpen(false);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        (n.content || "").toLowerCase().includes(q)
    );
  }, [notes, search]);

  return (
    <div className="min-h-screen">
      <TopNav onAdd={handleAdd} search={search} onSearchChange={setSearch} />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        <section
          className="relative rounded-2xl p-6"
          style={{ background: "var(--gradient)" }}
        >
          <div className="absolute inset-0 -z-10 pointer-events-none" />
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Your notes</h1>
            <div className="text-sm text-gray-500">
              {filtered.length} {filtered.length === 1 ? "note" : "notes"}
            </div>
          </div>
        </section>

        <section className="mt-6">
          {error ? (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          ) : null}
          {loading ? (
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card h-40 animate-pulse bg-gray-100" />
              ))}
            </div>
          ) : (
            <NotesGrid notes={filtered} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </section>
      </main>

      <NoteModal
        open={modalOpen}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
