import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getHistory, groupByDate, type CheckInEntry } from "./historyStore";
import FlowButton from "./FlowButton";

interface HistoryScreenProps {
  onBack: () => void;
}

const EntryCard = ({ entry }: { entry: CheckInEntry }) => {
  const { t } = useTranslation();
  const time = new Date(entry.date).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="bg-card rounded-2xl p-4 border border-border w-full text-left animate-soft-fade">
      <div className="flex items-center justify-between mb-2">
        <span className="text-muted-foreground font-body text-sm">{time}</span>
        <span
          className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${entry.path === "no-symptoms"
            ? "bg-secondary/30 text-secondary-foreground"
            : "bg-accent/30 text-accent-foreground"
            }`}
        >
          {entry.path === "no-symptoms" ? t("no_symptoms") : t("symptoms_logged")}
        </span>
      </div>

      {entry.path === "yes-symptoms" && (
        <>
          {entry.symptoms && entry.symptoms.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {entry.symptoms.map((s) => (
                <span
                  key={s}
                  className="text-xs bg-secondary/20 text-foreground px-2 py-0.5 rounded-full"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
          {entry.otherText && (
            <p className="text-muted-foreground text-xs italic mb-2">"{entry.otherText}"</p>
          )}
          {entry.intensity !== undefined && (
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${entry.intensity * 10}%` }}
                />
              </div>
              <span className="text-xs font-medium text-foreground whitespace-nowrap">
                {entry.intensity}/10 · {entry.intensityLabel}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const HistoryScreen = ({ onBack }: HistoryScreenProps) => {
  const { t } = useTranslation();
  const [history, setHistory] = useState<CheckInEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const data = await getHistory();
      setHistory(data);
      setLoading(false);
    };
    fetchHistory();
  }, []);

  const grouped = groupByDate(history);
  const dateKeys = Object.keys(grouped);

  return (
    <div className="flex flex-col min-h-screen px-6 pt-12 pb-8 w-full animate-step-enter">
      <div className="flex items-center mb-8">
        <button
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground transition-colors mr-3"
          aria-label="Go back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="font-heading text-2xl font-semibold text-foreground">{t("checkin_history")}</h1>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-secondary" />
        </div>
      ) : dateKeys.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <p className="text-muted-foreground font-body text-base mb-2">{t("no_checkins_yet")}</p>
          <p className="text-muted-foreground/70 font-body text-sm">
            {t("complete_first_checkin")}
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-6 pb-4">
          {dateKeys.map((dateKey) => (
            <div key={dateKey}>
              <p className="text-muted-foreground font-body text-xs font-medium uppercase tracking-wider mb-3">
                {dateKey}
              </p>
              <div className="space-y-3">
                {grouped[dateKey].map((entry) => (
                  <EntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-4">
        <FlowButton variant="primary" onClick={onBack}>
          {t("back_to_checkin")}
        </FlowButton>
      </div>
    </div>
  );
};

export default HistoryScreen;
