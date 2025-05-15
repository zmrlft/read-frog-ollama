export function APIConfigWarning({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-md border border-amber-500 bg-amber-100 px-2 py-1.5 text-center text-sm font-medium",
        className,
      )}
    >
      You must{" "}
      <a
        href="https://readfrog.mengxi.work/tutorial/api-key"
        target="_blank"
        rel="noreferrer"
        className="underline"
      >
        set the API key
      </a>{" "}
      first on the{" "}
      <button
        className="cursor-pointer underline"
        onClick={() => sendMessage("openOptionsPage", undefined)}
      >
        options
      </button>{" "}
      page.
    </div>
  );
}
