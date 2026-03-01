# Exterminator Demo App

A React + TypeScript task management app used to demo the **Exterminator** bug-fix pipeline — an AI agent that automatically reproduces, fixes, and validates browser errors.

## The Bug

The app ships with an intentional bug. On the **Tasks** page, clicking **Export CSV** crashes with:

```
TypeError: Cannot read properties of null (reading 'join')
    at exportToCSV (Tasks.tsx:14)
    at HTMLButtonElement.onClick (Tasks.tsx:57)
```

**Root cause:** One task (`Migrate legacy user records`) was imported from a legacy system with `tags: null`. The `exportToCSV` function calls `task.tags.join(", ")` without a null check.

**Fix:** `task.tags.join(", ")` → `(task.tags ?? []).join(", ")`

## Running the app

**Prerequisites:** Node.js 18+, and either `npm`, `pnpm`, or `yarn`.

```bash
# Install dependencies
pnpm install   # or: npm install

# Start the dev server (defaults to http://localhost:5173)
pnpm dev       # or: npm run dev
```

To run on a specific port (e.g. 3001, as used by the Exterminator pipeline):

```bash
pnpm dev --port 3001
```

## Reproducing the bug

1. Open the app in your browser
2. Click **Tasks** in the sidebar
3. Click **Export CSV**
4. The app crashes with a red error screen — `TypeError: Cannot read properties of null (reading 'join')`

## Using with Exterminator

The Exterminator pipeline takes a stack trace + the running app URL and automatically:
1. **Reproduces** the error using a browser agent
2. **Fixes** the source code using an AI coding agent
3. **Validates** the fix by re-running the reproduction steps

To point the pipeline at this app, initialize a run context from `ai/runner/`:

```python
from context import PipelineContext

ctx = PipelineContext.create(
    stack_trace="""TypeError: Cannot read properties of null (reading 'join')
    at exportToCSV (Tasks.tsx:14:16)
    at HTMLButtonElement.onClick (Tasks.tsx:57:32)""",
    source_dir="/path/to/this/repo/src",
    app_url="http://localhost:3001",
    app_description="React task management app. Clicking Export CSV on the Tasks page crashes because one task has tags: null.",
)
print(ctx.run_id)
```

Then run each step:

```bash
python run_browser_agent.py reproduce --run-id <id>
python run_fix.py --run-id <id>
python run_browser_agent.py validate --run-id <id>
```

See [`ai/runner/SETUP.md`](https://github.com/stack-auth/exterminator/blob/main/ai/runner/SETUP.md) in the main repo for full setup instructions.
