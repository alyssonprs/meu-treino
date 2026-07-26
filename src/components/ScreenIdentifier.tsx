type ScreenIdentifierProps = {
  compact?: boolean;
  code: `UX-${string}`;
  className?: string;
};

export function ScreenIdentifier({
  compact = false,
  code,
  className = "",
}: ScreenIdentifierProps) {
  return (
    <div
      aria-label={`Codigo da tela ${code}`}
      className={[
        compact ? "mt-0 flex justify-end pt-3 text-[0.625rem] font-medium uppercase tracking-wide text-md-on-surface-variant/55" : "mt-auto flex justify-end pt-3 text-[0.625rem] font-medium uppercase tracking-wide text-md-on-surface-variant/55",
        className,
      ].join(" ")}
    >
      <span>{code}</span>
    </div>
  );
}
