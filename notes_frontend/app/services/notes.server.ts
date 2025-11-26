export type Note = {
  id: string;
  title: string;
  content?: string;
  createdAt: number;
  updatedAt: number;
};

type CreateNoteInput = {
  title: string;
  content?: string;
};

type UpdateNoteInput = Partial<CreateNoteInput> & { id: string };

const getApiBase = () => {
  const v =
    (typeof window !== "undefined"
      ? ((import.meta as unknown) as { env?: Record<string, string | undefined> })
          ?.env
      : (process?.env as Record<string, string | undefined>)) || {};
  return v.VITE_API_BASE || v.VITE_BACKEND_URL || "";
};

const STORAGE_KEY = "notes.app.data.v1";

function readLocal(): Note[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(notes: Note[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function seedIfFirstRun() {
  if (typeof window === "undefined") return;
  const existing = readLocal();
  if (existing.length > 0) return;
  const now = Date.now();
  const sample: Note[] = [
    {
      id: cryptoRandomId(),
      title: "Welcome to Notes",
      content:
        "This is your personal notes space. Create, edit, and delete notes. Your notes are saved locally for now.",
      createdAt: now - 1000 * 60 * 60 * 24 * 2,
      updatedAt: now - 1000 * 60 * 60 * 20,
    },
    {
      id: cryptoRandomId(),
      title: "Ocean Professional Theme",
      content:
        "Primary #2563EB, Amber accents #F59E0B, Error #EF4444. Clean UI, rounded corners, subtle gradients.",
      createdAt: now - 1000 * 60 * 60 * 24,
      updatedAt: now - 1000 * 60 * 30,
    },
  ];
  writeLocal(sample);
}

function cryptoRandomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // @ts-expect-error: randomUUID is supported in modern runtimes
    return (crypto as unknown as { randomUUID: () => string }).randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * PUBLIC_INTERFACE
 * getNotesService returns an implementation with list/create/update/remove methods.
 * Primarily included for parity; prefer the client variant in browser routes.
 */
export function getNotesService() {
  const apiBase = getApiBase();
  const canUseApi = !!apiBase;

  async function api<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${apiBase.replace(/\/$/, "")}${path}`;
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
      ...init,
    });
    if (!res.ok) {
      throw new Error(`API error ${res.status}`);
    }
    return res.json() as Promise<T>;
  }

  // Local mode helpers
  function localList(): Note[] {
    seedIfFirstRun();
    return readLocal()
      .slice()
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  function localCreate(input: CreateNoteInput): Note {
    const now = Date.now();
    const newNote: Note = {
      id: cryptoRandomId(),
      title: input.title.trim(),
      content: input.content?.trim() || "",
      createdAt: now,
      updatedAt: now,
    };
    const notes = readLocal();
    notes.unshift(newNote);
    writeLocal(notes);
    return newNote;
  }

  function localUpdate(update: UpdateNoteInput): Note {
    const notes = readLocal();
    const idx = notes.findIndex((n) => n.id === update.id);
    if (idx === -1) throw new Error("Note not found");
    const now = Date.now();
    const updated: Note = {
      ...notes[idx],
      ...(update.title !== undefined ? { title: update.title.trim() } : {}),
      ...(update.content !== undefined
        ? { content: update.content.trim() }
        : {}),
      updatedAt: now,
    };
    notes[idx] = updated;
    writeLocal(notes);
    return updated;
  }

  function localRemove(id: string) {
    const notes = readLocal();
    writeLocal(notes.filter((n) => n.id !== id));
  }

  return {
    // PUBLIC_INTERFACE
    async list(): Promise<Note[]> {
      if (canUseApi) {
        try {
          return await api<Note[]>("/notes", { method: "GET" });
        } catch {
          return localList();
        }
      }
      return localList();
    },
    // PUBLIC_INTERFACE
    async create(input: CreateNoteInput): Promise<Note> {
      if (canUseApi) {
        try {
          return await api<Note>("/notes", {
            method: "POST",
            body: JSON.stringify(input),
          });
        } catch {
          return localCreate(input);
        }
      }
      return localCreate(input);
    },
    // PUBLIC_INTERFACE
    async update(update: UpdateNoteInput): Promise<Note> {
      if (canUseApi) {
        try {
          return await api<Note>(`/notes/${encodeURIComponent(update.id)}`, {
            method: "PUT",
            body: JSON.stringify(update),
          });
        } catch {
          return localUpdate(update);
        }
      }
      return localUpdate(update);
    },
    // PUBLIC_INTERFACE
    async remove(id: string): Promise<void> {
      if (canUseApi) {
        try {
          await api(`/notes/${encodeURIComponent(id)}`, { method: "DELETE" });
          return;
        } catch {
          localRemove(id);
          return;
        }
      }
      localRemove(id);
    },
  };
}
