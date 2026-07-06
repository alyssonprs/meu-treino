type ScreenIdentifierProps = {
  code: `UX-${string}`;
  className?: string;
};

export function ScreenIdentifier({
  code,
  className = "",
}: ScreenIdentifierProps) {
  return (
    <div
      aria-label={`Codigo da tela ${code}`}
      className={[
        "pointer-events-none fixed inset-x-0 bottom-20 z-30 mx-auto flex w-full max-w-md justify-end px-4 text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground/55",
        className,
      ].join(" ")}
    >
      <span>{code}</span>
    </div>
  );
}
