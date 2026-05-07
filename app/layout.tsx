@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #f6f8fb;
  --foreground: #0f172a;
}

body {
  background: var(--background);
  color: var(--foreground);
}

.card {
  @apply rounded-2xl border border-slate-200 bg-white shadow-sm;
}

.label {
  @apply text-xs font-semibold uppercase tracking-wide text-slate-500;
}
