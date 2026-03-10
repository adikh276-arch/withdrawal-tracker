import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import StepWrapper from "./StepWrapper";
import FlowButton from "./FlowButton";
import HistoryScreen from "./HistoryScreen";
import { saveCheckIn } from "./historyStore";

type Step =
  | "start"
  | "no-confirm"
  | "no-done"
  | "yes-symptoms"
  | "yes-intensity"
  | "yes-reassurance"
  | "yes-done";

type View = "flow" | "history";

const SYMPTOMS = [
  "irritability",
  "restlessness",
  "headache",
  "low_mood",
  "trouble_sleeping",
  "strong_cravings",
  "other",
];

const HealingCheckFlow = () => {
  const { t } = useTranslation();
  const [view, setView] = useState<View>("flow");
  const [step, setStep] = useState<Step>("start");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [otherText, setOtherText] = useState("");
  const [intensity, setIntensity] = useState(5);
  const [sliderTouched, setSliderTouched] = useState(false);
  const [completing, setCompleting] = useState(false);

  const intensityLabel = (val: number) => {
    if (val <= 2) return t("very_mild");
    if (val <= 4) return t("mild");
    if (val <= 6) return t("moderate");
    if (val <= 8) return t("strong");
    return t("very_strong");
  };

  const supportLine = (val: number) => {
    if (val <= 2) return { primary: t("passing_signal"), secondary: t("still_in_control") };
    if (val <= 4) return { primary: t("handled_level_before"), secondary: t("not_turn_into_action") };
    if (val <= 6) return { primary: t("moment_to_pause"), secondary: t("take_one_breath") };
    if (val <= 8) return { primary: t("feels_intense"), secondary: t("not_respond_immediately") };
    return { primary: t("this_is_a_wave"), secondary: t("pause_one_minute") };
  };

  const goTo = useCallback((next: Step) => {
    setStep(next);
  }, []);

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleFinish = async (path: "no-symptoms" | "yes-symptoms") => {
    // Save to history
    await saveCheckIn({
      path,
      ...(path === "yes-symptoms" && {
        symptoms: selectedSymptoms.map(s => t(s)),
        otherText: otherText || undefined,
        intensity,
        intensityLabel: intensityLabel(intensity),
      }),
    });

    setCompleting(true);
    setTimeout(() => {
      setStep("start");
      setSelectedSymptoms([]);
      setOtherText("");
      setIntensity(5);
      setSliderTouched(false);
      setCompleting(false);
    }, 600);
  };

  if (view === "history") {
    return <HistoryScreen onBack={() => setView("flow")} />;
  }

  if (step === "start") {
    return (
      <StepWrapper stepKey="start">
        <h1 className="font-heading text-3xl font-semibold text-foreground mb-2">
          🌿 {t("healing_check")}
        </h1>
        <p className="text-muted-foreground font-body text-base mb-10 leading-relaxed">
          {t("body_adjusting")}
        </p>
        <p className="text-foreground font-body text-lg mb-8 max-w-xs leading-relaxed">
          {t("feeling_symptoms")}
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <FlowButton variant="primary" onClick={() => goTo("yes-symptoms")}>
            {t("yes")}
          </FlowButton>
          <FlowButton variant="default" onClick={() => goTo("no-confirm")}>
            {t("no")}
          </FlowButton>
        </div>
        <button
          onClick={() => setView("history")}
          className="mt-10 flex items-center gap-2 text-muted-foreground font-body text-sm hover:text-foreground transition-colors bg-card/60 px-5 py-3 border border-border"
          style={{ borderRadius: 22 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {t("view_history")}
        </button>
      </StepWrapper>
    );
  }

  if (step === "no-confirm") {
    return (
      <StepWrapper stepKey="no-confirm">
        <p className="font-heading text-2xl font-semibold text-foreground mb-4 animate-soft-fade">
          {t("no_noticeable_symptoms")}
        </p>
        <p className="text-secondary font-body text-lg mb-10 animate-delayed-fade">
          {t("thats_a_good_sign")}
        </p>
        <FlowButton variant="primary" onClick={() => goTo("no-done")}>
          {t("continue")}
        </FlowButton>
      </StepWrapper>
    );
  }

  if (step === "no-done") {
    return (
      <StepWrapper stepKey="no-done">
        <div className={completing ? "animate-completion" : ""}>
          <p className="font-heading text-2xl font-semibold text-foreground mb-4 animate-soft-fade">
            {t("system_stabilizing")}
          </p>
          <p className="text-muted-foreground font-body text-base mb-10 max-w-xs leading-relaxed animate-delayed-fade">
            {t("day_without_nicotine")}
          </p>
          <FlowButton variant="primary" onClick={() => handleFinish("no-symptoms")}>
            {t("done")}
          </FlowButton>
        </div>
      </StepWrapper>
    );
  }

  if (step === "yes-symptoms") {
    return (
      <StepWrapper stepKey="yes-symptoms">
        <p className="font-heading text-2xl font-semibold text-foreground mb-6">
          {t("what_feels_noticeable")}
        </p>
        <div className="flex flex-col gap-2.5 w-full max-w-xs mb-8">
          {SYMPTOMS.map((s) => (
            <FlowButton
              key={s}
              variant={selectedSymptoms.includes(s) ? "sage-selected" : "option"}
              onClick={() => toggleSymptom(s)}
            >
              {t(s)}
            </FlowButton>
          ))}
        </div>
        {selectedSymptoms.includes("other") && (
          <textarea
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            placeholder={t("describe_feeling")}
            className="w-full max-w-xs rounded-lg border border-border bg-card p-3 font-body text-sm text-foreground placeholder:text-muted-foreground resize-none mb-6 focus:outline-none focus:ring-2 focus:ring-secondary"
            style={{ borderRadius: 16 }}
            rows={3}
          />
        )}
        {selectedSymptoms.length > 0 && (
          <FlowButton
            variant="primary"
            onClick={() => goTo("yes-intensity")}
            className="animate-soft-fade"
          >
            {t("continue")}
          </FlowButton>
        )}
      </StepWrapper>
    );
  }

  if (step === "yes-intensity") {
    return (
      <StepWrapper stepKey="yes-intensity">
        <p className="font-heading text-2xl font-semibold text-foreground mb-10">
          {t("how_intense")}
        </p>
        <div className="w-full max-w-xs mb-4">
          <input
            type="range"
            min={1}
            max={10}
            value={intensity}
            onChange={(e) => {
              setIntensity(Number(e.target.value));
              setSliderTouched(true);
            }}
            className="healing-slider w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground font-body mt-1 px-1">
            <span>1</span>
            <span>10</span>
          </div>
        </div>
        <p
          className="text-accent-foreground font-body text-lg font-medium mb-8 transition-opacity duration-300"
          key={intensity}
          style={{ animation: "softFade 300ms ease-in forwards" }}
        >
          {intensity} — {intensityLabel(intensity)}
        </p>
        {sliderTouched && (
          <FlowButton
            variant="primary"
            onClick={() => goTo("yes-reassurance")}
            className="animate-soft-fade"
          >
            {t("continue")}
          </FlowButton>
        )}
      </StepWrapper>
    );
  }

  if (step === "yes-reassurance") {
    const support = supportLine(intensity);
    return (
      <StepWrapper stepKey="yes-reassurance">
        <div className="relative flex flex-col items-center">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
            <div
              className="w-48 h-48 rounded-full bg-secondary animate-ripple-pulse"
              style={{ filter: "blur(30px)" }}
            />
          </div>
          <p className="font-heading text-2xl font-semibold text-foreground mb-4 animate-soft-fade">
            {support.primary}
          </p>
          <p className="text-muted-foreground font-body text-base max-w-xs leading-relaxed mb-10 animate-delayed-fade">
            {support.secondary}
          </p>
          <FlowButton variant="primary" onClick={() => goTo("yes-done")}>
            {t("i_understand")}
          </FlowButton>
        </div>
      </StepWrapper>
    );
  }

  if (step === "yes-done") {
    return (
      <StepWrapper stepKey="yes-done">
        <div className={completing ? "animate-completion" : ""}>
          <p className="font-heading text-2xl font-semibold text-foreground mb-4 animate-soft-fade">
            {t("healing_uncomfortable")}
          </p>
          <p className="text-muted-foreground font-body text-base max-w-xs leading-relaxed mb-10 animate-delayed-fade">
            {t("body_learning")}
          </p>
          <FlowButton variant="primary" onClick={() => handleFinish("yes-symptoms")}>
            {t("finish_checkin")}
          </FlowButton>
        </div>
      </StepWrapper>
    );
  }

  return null;
};

export default HealingCheckFlow;
