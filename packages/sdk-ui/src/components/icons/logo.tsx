export function Logo({ width = 40, height = 40, isLong = false }: { width?: number, height?: number, isLong?: boolean }) {
  const logoSrc = "/tracelet-docs/logo.svg";
  return (
    <div className="flex items-center gap-2">
      <img
        src={logoSrc}
        alt="Tracelet"
        width={width}
        height={height}
        className="object-contain"
      />
      {isLong && <span className="text-2xl font-bold">Tracelet</span>}
    </div>
  );
}
