import { ReactNode, useEffect, useState } from "react";

interface StepWrapperProps {
  children: ReactNode;
  stepKey: string;
}

const StepWrapper = ({ children, stepKey }: StepWrapperProps) => {
  const [animClass, setAnimClass] = useState("animate-step-enter");

  useEffect(() => {
    setAnimClass("animate-step-enter");
  }, [stepKey]);

  return (
    <div
      key={stepKey}
      className={`flex flex-col items-center justify-center min-h-screen px-6 text-center w-full ${animClass}`}
    >
      {children}
    </div>
  );
};

export default StepWrapper;
