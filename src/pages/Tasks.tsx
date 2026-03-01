import { useState } from "react";
import type { Task } from "../store";
import { TaskDetail } from "../components/TaskDetail";
import { ErrorBoundary } from "../components/ErrorBoundary";

const PRIORITY_COLORS = {
  low: "bg-brutal-blue text-brutal-black",
  medium: "bg-brutal-yellow text-brutal-black",
  high: "bg-brutal-red text-white",
};

export function Tasks({
  tasks,
  onAdd,
  onToggle,
  onDelete,
}: {
  tasks: Task[];
  onAdd: (title: string, priority: Task["priority"]) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const filtered = tasks.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim(), priority);
    setTitle("");
  }

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0">
        <h2 className="text-2xl font-black text-brutal-black uppercase">
          Tasks
        </h2>
        <p className="mt-1 text-sm font-medium text-neutral-500">
          Manage your to-do list
        </p>

        <form onSubmit={handleAdd} className="mt-5 flex gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 border-3 border-brutal-black bg-white px-3 py-2 text-sm text-brutal-black placeholder-neutral-400 outline-none"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Task["priority"])}
            className="border-3 border-brutal-black bg-white px-3 py-2 text-sm text-brutal-black outline-none cursor-pointer"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button
            type="submit"
            className="border-3 border-brutal-black bg-brutal-purple px-4 py-2 text-sm font-black text-white shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer"
          >
            Add
          </button>
        </form>

        <div className="mt-4 flex gap-1">
          {(["all", "active", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`border-2 border-brutal-black px-3 py-1 text-xs font-bold transition-all capitalize cursor-pointer ${
                filter === f
                  ? "bg-brutal-black text-white"
                  : "bg-white text-brutal-black hover:bg-neutral-100"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <ul className="mt-4 space-y-2">
          {filtered.map((task) => (
            <li
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className={`group flex items-center gap-3 border-3 px-4 py-3 transition-all cursor-pointer ${
                selectedTask?.id === task.id
                  ? "border-brutal-black bg-brutal-yellow shadow-brutal-sm"
                  : "border-brutal-black bg-white hover:translate-x-0.5 hover:translate-y-0.5 shadow-brutal-sm hover:shadow-none"
              }`}
            >
              <button
                onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
                className={`flex h-5 w-5 shrink-0 items-center justify-center border-2 border-brutal-black transition-colors cursor-pointer ${
                  task.completed
                    ? "bg-brutal-green text-white"
                    : "bg-white hover:bg-neutral-100"
                }`}
              >
                {task.completed && (
                  <span className="text-xs leading-none font-black">✓</span>
                )}
              </button>

              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-bold ${
                    task.completed
                      ? "text-neutral-400 line-through"
                      : "text-brutal-black"
                  }`}
                >
                  {task.title}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`border border-brutal-black px-1.5 py-0.5 text-[10px] font-black uppercase ${PRIORITY_COLORS[task.priority]}`}
                  >
                    {task.priority}
                  </span>
                  {task.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="border border-neutral-300 bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {task.assignee?.name && (
                  <div
                    className="flex h-6 w-6 items-center justify-center border-2 border-brutal-black bg-brutal-pink text-[10px] font-black text-brutal-black"
                    title={task.assignee.name}
                  >
                    {task.assignee.name.split(" ").map((w) => w[0]).join("")}
                  </div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                  className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-brutal-red transition-all text-sm font-black cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="border-3 border-dashed border-neutral-300 py-8 text-center text-sm font-bold text-neutral-400">
              No tasks to show
            </li>
          )}
        </ul>
      </div>

      {selectedTask && (
        <ErrorBoundary key={selectedTask.id}>
          <TaskDetail
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
          />
        </ErrorBoundary>
      )}
    </div>
  );
}
