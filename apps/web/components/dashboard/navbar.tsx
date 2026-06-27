import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface DashboardNavbarProps {
  onLogout: () => void;
}

export function DashboardNavbar({ onLogout }: DashboardNavbarProps) {
  return (
    <header className="sticky top-0 z-20 bg-canvas/80 backdrop-blur-md border-b border-hairline animate-fade-in">
      <div className="mx-auto w-full max-w-2xl px-5 sm:px-6 h-[60px] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="size-7 flex items-center justify-center bg-accent rounded-sm">
            <span className="text-canvas font-normal text-[11px]">A</span>
          </div>
          <span className="text-[15px] font-normal text-ink tracking-tight">
            Auth
          </span>
        </div>

        <Button variant="outline" onClick={onLogout}>
          <LogOut className="size-4" />
          Keluar
        </Button>
      </div>
    </header>
  );
}
