import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  delay?: number;
}

export function StatCard({ label, value, delay = 0 }: StatCardProps) {
  return (
    <Card
      className="animate-fade-up px-5 py-4 flex flex-col gap-1 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <span className="text-base font-bold text-foreground">{value}</span>
    </Card>
  );
}
