import { useState, useCallback } from "react";
import StepWrapper from "./StepWrapper";
import FlowButton from "./FlowButton";

type Step =
  | "start"
  | "no-confirm"
  | "no-done"
  | "yes-symptoms"
  | "yes-intensity"
  | "yes-reassurance"
  | "yes-done";

const SYMPTOMS = [
  "Irritability",
  "Restlessness",
  "Headache",
  "Low mood",
  "Trouble sleeping",
  "Strong cravings",
  "Other",
];

function intensityLabel(val: number) {
  if (val <= 3) return "Light";
  if (val <= 6) return "Manageable";
  if (val <= 8) return "Strong";
  return "Very intense";
}

const HealingCheckFlow = () => {
  const [step, setStep] = useState<Step>("start");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [otherText, setOtherText] = useState("");
  const [intensity, setIntensity] = useState(5);
  const [sliderTouched, setSliderTouched] = useState(false);
  const [completing, setCompleting] = useState(false);

  const goTo = useCallback((next: Step) => {
    setStep(next);
  }, []);

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleFinish = () => {
    setCompleting(true);
    setTimeout(() => {
      // Reset flow
      setStep("start");
      setSelectedSymptoms([]);
      setOtherText("");
      setIntensity(5);
      setSliderTouched(false);
      setCompleting(false);
    }, 600);
  };

  if (step === "start") {
    return (
      <StepWrapper stepKey="start">
        <h1 className="font-heading text-3xl font-semibold text-foreground mb-2">
          🌿 Healing Check
        </h1>
        <p className="text-muted-foreground font-body text-base mb-10 leading-relaxed">
          Your body is adjusting.
        </p>
        <p className="text-foreground font-body text-lg mb-8 max-w-xs leading-relaxed">
          Are you feeling any withdrawal symptoms right now?
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <FlowButton variant="primary" onClick={() => goTo("yes-symptoms")}>
            Yes
          </FlowButton>
          <FlowButton variant="default" onClick={() => goTo("no-confirm")}>
            No
          </FlowButton>
        </div>
      </StepWrapper>
    );
  }

  if (step === "no-confirm") {
    return (
      <StepWrapper stepKey="no-confirm">
        <p className="font-heading text-2xl font-semibold text-foreground mb-4 animate-soft-fade">
          No noticeable symptoms.
        </p>
        <p className="text-secondary font-body text-lg mb-10 animate-delayed-fade">
          That's a good sign.
        </p>
        <FlowButton variant="primary" onClick={() => goTo("no-done")}>
          Continue
        </FlowButton>
      </StepWrapper>
    );
  }

  if (step === "no-done") {
    return (
      <StepWrapper stepKey="no-done">
        <div className={completing ? "animate-completion" : ""}>
          <p className="font-heading text-2xl font-semibold text-foreground mb-4 animate-soft-fade">
            Your system is stabilizing.
          </p>
          <p className="text-muted-foreground font-body text-base mb-10 max-w-xs leading-relaxed animate-delayed-fade">
            Each day without nicotine helps your body reset.
          </p>
          <FlowButton variant="primary" onClick={handleFinish}>
            Done
          </FlowButton>
        </div>
      </StepWrapper>
    );
  }

  if (step === "yes-symptoms") {
    return (
      <StepWrapper stepKey="yes-symptoms">
        <p className="font-heading text-2xl font-semibold text-foreground mb-6">
          What feels most noticeable?
        </p>
        <div className="flex flex-col gap-2.5 w-full max-w-xs mb-8">
          {SYMPTOMS.map((s) => (
            <FlowButton
              key={s}
              variant={selectedSymptoms.includes(s) ? "sage-selected" : "option"}
              onClick={() => toggleSymptom(s)}
            >
              {s}
            </FlowButton>
          ))}
        </div>
        {selectedSymptoms.includes("Other") && (
          <textarea
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            placeholder="Describe what you're feeling..."
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
            Continue
          </FlowButton>
        )}
      </StepWrapper>
    );
  }

  if (step === "yes-intensity") {
    return (
      <StepWrapper stepKey="yes-intensity">
        <p className="font-heading text-2xl font-semibold text-foreground mb-10">
          How intense is it right now?
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
          key={intensityLabel(intensity)}
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
            Continue
          </FlowButton>
        )}
      </StepWrapper>
    );
  }

  if (step === "yes-reassurance") {
    return (
      <StepWrapper stepKey="yes-reassurance">
        <div className="relative flex flex-col items-center">
          {/* Ripple effect */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
            <div
              className="w-48 h-48 rounded-full bg-secondary animate-ripple-pulse"
              style={{ filter: "blur(30px)" }}
            />
          </div>
          <p className="font-heading text-2xl font-semibold text-foreground mb-4 animate-soft-fade">
            This is temporary.
          </p>
          <p className="text-muted-foreground font-body text-base max-w-xs leading-relaxed mb-10 animate-delayed-fade">
            Withdrawal means your body is recalibrating.
          </p>
          <FlowButton variant="primary" onClick={() => goTo("yes-done")}>
            I understand
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
            You're healing, even if it's uncomfortable.
          </p>
          <p className="text-muted-foreground font-body text-base max-w-xs leading-relaxed mb-10 animate-delayed-fade">
            Your body is learning to function without nicotine — and that's
            powerful.
          </p>
          <FlowButton variant="primary" onClick={handleFinish}>
            Finish Check-In
          </FlowButton>
        </div>
      </StepWrapper>
    );
  }

  return null;
};

export default HealingCheckFlow;
