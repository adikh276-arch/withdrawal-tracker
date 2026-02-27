interface FlowButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "primary" | "option" | "selected" | "sage-selected";
  className?: string;
}

const FlowButton = ({ children, onClick, variant = "default", className = "" }: FlowButtonProps) => {
  const base =
    "w-full max-w-xs min-h-[52px] rounded-lg font-body text-base font-medium active-press transition-all duration-200 select-none";

  const variants: Record<string, string> = {
    default:
      "bg-muted text-foreground hover:bg-muted/80",
    primary:
      "bg-primary text-primary-foreground hover:opacity-90",
    option:
      "bg-card text-foreground border border-border hover:border-secondary",
    selected:
      "bg-primary text-primary-foreground",
    "sage-selected":
      "bg-secondary text-secondary-foreground border border-secondary",
  };

  return (
    <button
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
      style={{ borderRadius: 22 }}
    >
      {children}
    </button>
  );
};

export default FlowButton;
