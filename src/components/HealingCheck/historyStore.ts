import { pool } from "@/lib/db";

export interface CheckInEntry {
  id: string;
  date: string; // ISO string
  path: "no-symptoms" | "yes-symptoms";
  symptoms?: string[];
  otherText?: string;
  intensity?: number;
  intensityLabel?: string;
}

export async function saveCheckIn(entry: Omit<CheckInEntry, "id" | "date">): Promise<void> {
  const userId = sessionStorage.getItem("user_id");
  if (!userId) return;

  try {
    await pool.query(
      `INSERT INTO withdrawal_logs 
       (user_id, path, symptoms, other_text, intensity, intensity_label) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        BigInt(userId),
        entry.path,
        entry.symptoms,
        entry.otherText,
        entry.intensity,
        entry.intensityLabel
      ]
    );
  } catch (error) {
    console.error("Failed to save check-in:", error);
    throw error;
  }
}

export async function getHistory(): Promise<CheckInEntry[]> {
  const userId = sessionStorage.getItem("user_id");
  if (!userId) return [];

  try {
    const res = await pool.query(
      "SELECT * FROM withdrawal_logs WHERE user_id = $1 ORDER BY date DESC",
      [BigInt(userId)]
    );

    return res.rows.map(row => ({
      id: row.id,
      date: row.date.toISOString(),
      path: row.path,
      symptoms: row.symptoms,
      otherText: row.other_text,
      intensity: row.intensity,
      intensityLabel: row.intensity_label
    }));
  } catch (error) {
    console.error("Failed to fetch history:", error);
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
