import { cn } from "@/lib/utils";

/* ── card-content spec: bg-canvas-card, border-hairline, rounded-s(8px), padding xl(24px), no shadow ── */

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-canvas-card border border-hairline rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardContent({
  children,
  className,
  ...props
}: CardSectionProps) {
  return (
    <div className={cn("px-6 py-6", className)} {...props}>
      {children}
    </div>
  );
}
