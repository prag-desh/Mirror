const STORAGE_KEY = "mirror_reflections";
const MAX_ENTRIES = 10;

function safeParse(raw) {
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function getReflections() {
  if (typeof window === "undefined") return [];
  return safeParse(localStorage.getItem(STORAGE_KEY));
}

/**
 * @param {{ userInput: string, result: object, inputMode?: string }} payload
 */
export function saveReflection({ userInput, result, inputMode = "feeling" }) {
  if (typeof window === "undefined") return;
  if (!userInput?.trim() || !result?.patternName) return;

  const list = getReflections();
  const entry = {
    id: Date.now(),
    situation: userInput.trim(),
    patternName: result.patternName,
    date: new Date().toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }),
    shareInsight: result.shareInsight || "",
    result,
    inputMode
  };

  list.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_ENTRIES)));
}

export function getTopPatterns(minCount = 3) {
  const list = getReflections();
  if (list.length < minCount) return [];

  const counts = new Map();
  for (const item of list) {
    const name = item.patternName;
    if (!name) continue;
    counts.set(name, (counts.get(name) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));
}
