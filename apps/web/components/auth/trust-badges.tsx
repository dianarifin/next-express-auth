import { Shield, Lock, Zap } from "lucide-react";

const badges = [
  { label: "Aman", desc: "Enkripsi SSL", icon: Shield },
  { label: "Terenkripsi", desc: "Data terjaga", icon: Lock },
  { label: "Cepat", desc: "Login instan", icon: Zap },
];

export function TrustBadges() {
  return (
    <div className="flex items-center justify-center gap-6">
      {badges.map((b) => {
        const Icon = b.icon;
        return (
          <div key={b.label} className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center bg-brand-light">
              <Icon className="size-4 text-brand" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-foreground">
                {b.label}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                {b.desc}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
