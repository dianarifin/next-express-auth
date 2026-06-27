interface BadgeProps {
  children: React.ReactNode;
  variant?: "accent" | "muted";
}

export function Badge({ children, variant = "muted" }: BadgeProps) {
  const styles = {
    accent: "bg-accent/10 text-accent border border-accent/20",
    muted: "bg-canvas-soft text-body-mid border border-hairline",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[10px] tracking-[1.2px] uppercase ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
