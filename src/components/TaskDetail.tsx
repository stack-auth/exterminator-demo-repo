import type { Task } from "../store";

const PRIORITY_STYLES = {
  low: "bg-brutal-blue text-brutal-black",
  medium: "bg-brutal-yellow text-brutal-black",
  high: "bg-brutal-red text-white",
};

export function TaskDetail({
  task,
  onClose,
}: {
  task: Task;
  onClose: () => void;
}) {
  const [year, month, day] = task.dueDate.split("-").map(Number);
  const formattedDue = new Date(year, month - 1, day).toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric", year: "numeric" },
  );

  const initials = task.assignee.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-80 flex-col border-l-3 border-brutal-black bg-cream shadow-brutal-lg">
      <div className="flex items-start justify-between border-b-3 border-brutal-black p-5">
        <div className="flex-1 pr-4">
          <p className="text-xs font-black uppercase tracking-wider text-neutral-500">
            Task detail
          </p>
          <h3 className="mt-1 text-sm font-black text-brutal-black leading-snug">
            {task.title}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 border-2 border-brutal-black p-1 text-brutal-black hover:bg-brutal-red hover:text-white transition-colors cursor-pointer font-black"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
            Priority
          </p>
          <span
            className={`mt-1.5 inline-block border border-brutal-black px-2 py-0.5 text-xs font-black uppercase ${PRIORITY_STYLES[task.priority]}`}
          >
            {task.priority}
          </span>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
            Due date
          </p>
          <p className="mt-1.5 text-sm font-bold text-brutal-black">{formattedDue}</p>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
            Assignee
          </p>
          <div className="mt-1.5 flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center border-2 border-brutal-black bg-brutal-purple text-[11px] font-black text-white">
              {initials}
            </div>
            <p className="text-sm font-bold text-brutal-black">{task.assignee.name}</p>
          </div>
        </div>

        {task.tags && task.tags.length > 0 && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
              Tags
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-brutal-black bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-brutal-black"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
            Status
          </p>
          <p className="mt-1.5 text-sm font-bold text-brutal-black">
            {task.completed ? "Completed" : "In progress"}
          </p>
        </div>
      </div>
    </div>
  );
}
