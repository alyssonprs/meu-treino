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
        "flex justify-end text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground/55",
        className,
      ].join(" ")}
    >
      <span>{code}</span>
    </div>
  );
}
