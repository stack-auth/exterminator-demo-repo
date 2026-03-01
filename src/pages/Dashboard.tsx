import { useState } from "react";
import type { Task, Note } from "../store";

// --- deeply nested report pipeline ---

interface ReportNode {
  label: string;
  value: number;
  children?: ReportNode[];
  metadata?: { format: string };
}

function collectMetrics(tasks: Task[]): ReportNode[] {
  return tasks.map((t) => ({
    label: t.title,
    value: t.completed ? 1 : 0,
    children: t.tags?.map((tag) => ({
      label: tag,
      value: tag.length,
    })),
    metadata: t.completed ? { format: "done" } : undefined,
  }));
}

function aggregateNodes(nodes: ReportNode[]): ReportNode {
  return {
    label: "root",
    value: nodes.reduce((s, n) => s + n.value, 0),
    children: nodes,
  };
}

function normalizeTree(node: ReportNode): ReportNode {
  const children = (node.children ?? []).map(normalizeTree);
  return { ...node, children, value: node.value / (children.length || 1) };
}

function formatNode(node: ReportNode, depth: number): string {
  const header = `${"  ".repeat(depth)}${node.label}: ${node.value.toFixed(2)}${node.metadata ? ` [${node.metadata.format}]` : ""}`;
  const childLines = (node.children ?? []).map((c) => formatNode(c, depth + 1));
  return [header, ...childLines].join("\n");
}

function renderReport(node: ReportNode): string {
  return formatNode(node, 0);
}

function buildReport(tasks: Task[]): string {
  const metrics = collectMetrics(tasks);
  const tree = aggregateNodes(metrics);
  const normalized = normalizeTree(tree);
  return renderReport(normalized);
}

const CARD_COLORS = [
  "bg-brutal-blue",
  "bg-brutal-green",
  "bg-brutal-yellow",
  "bg-brutal-pink",
];

function StatCard({
  label,
  value,
  sub,
  colorClass,
}: {
  label: string;
  value: string | number;
  sub?: string;
  colorClass: string;
}) {
  return (
    <div
      className={`border-3 border-brutal-black ${colorClass} p-5 shadow-brutal`}
    >
      <p className="text-xs font-black text-brutal-black uppercase tracking-wider">
        {label}
      </p>
      <p className="mt-1 text-3xl font-black text-brutal-black">{value}</p>
      {sub && (
        <p className="mt-0.5 text-xs font-semibold text-brutal-black/70">
          {sub}
        </p>
      )}
    </div>
  );
}

export function Dashboard({
  tasks,
  notes,
}: {
  tasks: Task[];
  notes: Note[];
}) {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<{ message: string; stack?: string } | null>(null);

  function handleRunAnalysis() {
    setLoading(true);
    setShowModal(false);
    setError(null);

    setTimeout(() => {
      try {
        const result = buildReport(tasks);
        setReport(result);
        setShowModal(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const stack = err instanceof Error ? err.stack : undefined;
        setError({ message, stack });
        console.error(err);
        window.dispatchEvent(new ErrorEvent("error", {
          error: err,
          message,
        }));
      } finally {
        setLoading(false);
      }
    }, 800);
  }

  const completed = tasks.filter((t) => t.completed).length;
  const pending = tasks.filter((t) => !t.completed).length;
  const highPriority = tasks.filter(
    (t) => t.priority === "high" && !t.completed,
  ).length;
  const completionPct =
    tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  const pendingTasks = tasks.filter((t) => !t.completed);
  const totalTags = pendingTasks.reduce(
    (sum, t) => sum + (t.tags?.length ?? 0),
    0,
  );
  const avgTags =
    pendingTasks.length > 0
      ? (totalTags / pendingTasks.length).toFixed(1)
      : "0";

  return (
    <div>
      {/* Success modal */}
      {showModal && report && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-brutal-black/40"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col border-3 border-brutal-black bg-cream shadow-brutal-lg animate-[popIn_0.2s_ease-out]">
            <div className="flex items-center justify-between border-b-3 border-brutal-black bg-brutal-green px-6 py-4">
              <div>
                <p className="text-lg font-black text-brutal-black uppercase">
                  Analysis Complete
                </p>
                <p className="text-xs font-bold text-brutal-black/70 mt-0.5">
                  {tasks.length} tasks processed
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="border-2 border-brutal-black bg-white px-2 py-1 text-sm font-black text-brutal-black hover:bg-brutal-red hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-3 gap-3">
                <div className="border-3 border-brutal-black bg-brutal-blue p-4 shadow-brutal-sm">
                  <p className="text-[10px] font-black uppercase tracking-wider text-brutal-black/70">
                    Completion
                  </p>
                  <p className="text-2xl font-black text-brutal-black">
                    {completionPct}%
                  </p>
                  <div className="mt-2 h-2 border border-brutal-black bg-white">
                    <div
                      className="h-full bg-brutal-black transition-all"
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                </div>
                <div className="border-3 border-brutal-black bg-brutal-yellow p-4 shadow-brutal-sm">
                  <p className="text-[10px] font-black uppercase tracking-wider text-brutal-black/70">
                    Done / Total
                  </p>
                  <p className="text-2xl font-black text-brutal-black">
                    {completed}/{tasks.length}
                  </p>
                </div>
                <div className="border-3 border-brutal-black bg-brutal-pink p-4 shadow-brutal-sm">
                  <p className="text-[10px] font-black uppercase tracking-wider text-brutal-black/70">
                    High Priority
                  </p>
                  <p className="text-2xl font-black text-brutal-black">
                    {highPriority}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wider text-brutal-black mb-2">
                  Task Breakdown
                </p>
                <div className="space-y-1.5">
                  {tasks.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center gap-3 border-2 border-brutal-black bg-white px-3 py-2"
                    >
                      <span
                        className={`inline-block h-3 w-3 border border-brutal-black shrink-0 ${t.completed ? "bg-brutal-green" : "bg-neutral-200"}`}
                      />
                      <span className="text-xs font-bold text-brutal-black flex-1 truncate">
                        {t.title}
                      </span>
                      <span className="text-[10px] font-black uppercase text-neutral-500">
                        {t.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wider text-brutal-black mb-2">
                  Raw Report
                </p>
                <pre className="border-3 border-brutal-black bg-white p-4 text-xs font-mono text-brutal-black overflow-x-auto whitespace-pre-wrap shadow-brutal-sm">
                  {report}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-black text-brutal-black uppercase">
        Dashboard
      </h2>
      <p className="mt-1 text-sm font-medium text-neutral-500">
        Overview of your workspace
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Tasks"
          value={tasks.length}
          colorClass={CARD_COLORS[0]}
        />
        <StatCard
          label="Completed"
          value={completed}
          sub={`${completionPct}% done`}
          colorClass={CARD_COLORS[1]}
        />
        <StatCard
          label="Pending"
          value={pending}
          sub={`${avgTags} avg tags`}
          colorClass={CARD_COLORS[2]}
        />
        <StatCard
          label="High Priority"
          value={highPriority}
          colorClass={CARD_COLORS[3]}
        />
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-brutal-black uppercase tracking-wider">
            Analysis
          </h3>
          <button
            onClick={handleRunAnalysis}
            disabled={loading}
            className="border-3 border-brutal-black bg-brutal-orange px-4 py-1.5 text-sm font-black text-brutal-black shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-brutal-sm"
          >
            {loading ? "Analyzing…" : "Run Analysis"}
          </button>
        </div>

        {error && (
          <div className="border-3 border-brutal-black bg-brutal-red shadow-brutal animate-[popIn_0.2s_ease-out]">
            <div className="flex items-center justify-between border-b-2 border-brutal-black/30 px-5 py-3">
              <p className="text-sm font-black text-white uppercase">
                Analysis Failed
              </p>
              <button
                onClick={() => setError(null)}
                className="border-2 border-white/40 px-2 py-0.5 text-xs font-black text-white hover:bg-white hover:text-brutal-red transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <p className="text-sm font-bold text-white">
                {error.message}
              </p>
              {error.stack && (
                <pre className="border-2 border-white/20 bg-brutal-black/20 p-3 text-[11px] font-mono text-white/80 overflow-x-auto whitespace-pre-wrap">
                  {error.stack}
                </pre>
              )}
              <button
                onClick={handleRunAnalysis}
                className="border-2 border-white bg-white px-3 py-1.5 text-xs font-black text-brutal-red hover:bg-brutal-yellow hover:text-brutal-black hover:border-brutal-black transition-colors cursor-pointer"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-black text-brutal-black uppercase tracking-wider mb-3">
          Recent Notes
        </h3>
        {notes.length === 0 ? (
          <p className="text-sm font-medium text-neutral-400">No notes yet</p>
        ) : (
          <div className="space-y-2">
            {notes.slice(0, 3).map((note) => (
              <div
                key={note.id}
                className="border-3 border-brutal-black bg-white px-4 py-3 shadow-brutal-sm"
              >
                <p className="text-sm font-bold text-brutal-black">
                  {note.title || "Untitled"}
                </p>
                <p className="mt-0.5 text-xs text-neutral-500 truncate">
                  {note.body || "Empty note"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
