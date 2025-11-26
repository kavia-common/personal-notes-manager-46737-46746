type Props = {
  onAdd?: () => void;
  search: string;
  onSearchChange: (v: string) => void;
};

export default function TopNav({ onAdd, search, onSearchChange }: Props) {
  return (
    <header
      className="sticky top-0 z-30 border-b border-black/5 backdrop-blur bg-white/80"
      role="banner"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              aria-hidden
              className="h-9 w-9 rounded-xl"
              style={{
                background:
                  "conic-gradient(from 180deg at 50% 50%, #93C5FD, #2563EB 40%, #3B82F6)",
              }}
            />
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight">
                Notes
              </span>
              <span className="text-xs text-gray-500">Ocean Professional</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                aria-label="Search notes"
                placeholder="Search notes..."
                className="input pl-9 w-64"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              <svg
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.5 3a5.5 5.5 0 103.473 9.768l3.13 3.13a.75.75 0 101.06-1.06l-3.13-3.13A5.5 5.5 0 008.5 3zM5 8.5a3.5 3.5 0 116.951.5A3.5 3.5 0 015 8.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onAdd}
              aria-label="Add note"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M10 4a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V5a1 1 0 011-1z" />
              </svg>
              New
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
