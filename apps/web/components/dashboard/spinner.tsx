export function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <div className="flex flex-col items-center gap-4">
        <div className="w-9 h-9 border-[3px] border-body-mid/20 border-t-accent animate-spin rounded-full" />
        <p className="text-sm text-body-mid animate-pulse">
          Memuat data&hellip;
        </p>
      </div>
    </div>
  );
}
