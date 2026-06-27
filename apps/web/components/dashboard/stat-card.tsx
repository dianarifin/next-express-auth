import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  delay?: number;
}

export function StatCard({ label, value, delay = 0 }: StatCardProps) {
  return (
    <Card
      className="animate-fade-up px-5 py-4 flex flex-col gap-1 transition-colors duration-200"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="font-mono text-[10px] text-body-mid uppercase tracking-[1.2px]">
        {label}
      </span>
      <span className="text-base font-normal text-ink">{value}</span>
    </Card>
  );
}
