import type { MetaFunction } from "@remix-run/node";
import { useEffect, useMemo, useRef, useState } from "react";
import TopNav from "~/components/TopNav";
import NotesGrid from "~/components/NotesGrid";
import NoteModal from "~/components/NoteModal";
// Import only the Note type here; avoid importing client-only functions at module scope for SSR safety.
import type { Note } from "~/services/notes.client";

export const meta: MetaFunction = () => {
  return [
    { title: "Notes — Ocean Professional" },
    { name: "description", content: "Simple personal notes app." },
  ];
};

// A minimal interface the client service implements
type NotesService = {
  list: () => Promise<Note[]>;
  create: (input: { title: string; content?: string }) => Promise<Note>;
  update: (input: Partial<{ title: string; content?: string }> & { id: string }) => Promise<Note>;
  remove: (id: string) => Promise<void>;
};

export default function Index() {
  // During SSR we use a no-op service so the page can render; on client we swap it with the real service.
  const serviceRef = useRef<NotesService>({
    async list() {
      return [];
    },
    async create(input) {
      // Simple local echo for SSR fallback; client will replace this before user interaction.
      return {
        id: "temp",
        title: input.title,
        content: input.content,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as Note;
    },
    async update(input) {
      return {
        id: input.id,
        title: (input.title ?? "").toString(),
        content: (input.content ?? "").toString(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as Note;
    },
    async remove() {
      return;
    },
  });

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Note | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  // Lazily load the client-only service in the browser
  useEffect(() => {
    let cancelled = false;
    async function init() {
      if (typeof window === "undefined") return;
      try {
        const mod = await import("~/services/notes.client");
        if (!cancelled && mod && typeof mod.getClientNotesService === "function") {
          serviceRef.current = mod.getClientNotesService();
        }
      } catch (e) {
        // keep SSR-safe fallback service; show error banner
        console.error("Failed to load client service", e);
        setError("Failed to initialize client service; using local mode if available.");
      } finally {
        // After ensuring service is set, fetch notes
        if (!cancelled) {
          refresh();
        }
      }
    }
    init();
    return () => {
      cancelled = true;
    };
    // We intentionally run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const list = await serviceRef.current.list();
      setNotes(list);
    } catch {
      setError("Failed to load notes; using local mode if available.");
    } finally {
      setLoading(false);
    }
  }

  function handleAdd() {
    setEditing(undefined);
    setModalOpen(true);
  }

  function handleEdit(n: Note) {
    setEditing(n);
    setModalOpen(true);
  }

  async function handleDelete(id: string) {
    await serviceRef.current.remove(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  async function handleSubmit(data: { id?: string; title: string; content?: string }) {
    if (data.id) {
      const updated = await serviceRef.current.update({ id: data.id, title: data.title, content: data.content });
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    } else {
      const created = await serviceRef.current.create({ title: data.title, content: data.content });
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
