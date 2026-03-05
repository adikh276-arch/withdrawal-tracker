export interface CheckInEntry {
  id: string;
  date: string; // ISO string
  path: "no-symptoms" | "yes-symptoms";
  symptoms?: string[];
  otherText?: string;
  intensity?: number;
  intensityLabel?: string;
}

const STORAGE_KEY = "healing-check-history";

export function saveCheckIn(entry: Omit<CheckInEntry, "id" | "date">): void {
  const history = getHistory();
  history.unshift({
    ...entry,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function getHistory(): CheckInEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function groupByDate(entries: CheckInEntry[]): Record<string, CheckInEntry[]> {
  const groups: Record<string, CheckInEntry[]> = {};
  for (const entry of entries) {
    const dateKey = new Date(entry.date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(entry);
  }
  return groups;
}
