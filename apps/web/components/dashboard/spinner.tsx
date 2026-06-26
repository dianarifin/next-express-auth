export function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-9 h-9 border-[3px] border-muted-foreground/20 border-t-brand animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Memuat data&hellip;
        </p>
      </div>
    </div>
  );
}
