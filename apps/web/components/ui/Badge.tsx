interface BadgeProps {
  children: React.ReactNode;
  variant?: "red" | "gray";
}

export function Badge({ children, variant = "gray" }: BadgeProps) {
  const styles = {
    red: "bg-brand-muted text-brand border border-brand/20",
    gray: "bg-zinc-100 text-zinc-500 border border-zinc-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold tracking-widest uppercase ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
