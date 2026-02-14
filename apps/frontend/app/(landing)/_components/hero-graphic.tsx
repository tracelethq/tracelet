/**
 * Abstract geometric graphic for the hero section (Vite-style).
 * Uses Tracelet primary color palette.
 */
export function HeroGraphic() {
  return (
    <div
      className="relative h-full min-h-[280px] w-full max-w-[420px] sm:min-h-[340px] sm:max-w-[500px]"
      aria-hidden
    >
      <svg
        viewBox="0 0 400 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        {/* Back layer - large cube */}
        <g transform="translate(80, 120)">
          <path
            d="M0 80 L80 40 L160 80 L80 120 Z"
            className="fill-primary/20 dark:fill-primary/25"
          />
          <path
            d="M80 40 L80 120 L80 200 L80 120"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="stroke-primary/30"
          />
          <path
            d="M80 40 L160 80 L160 160 L80 120"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="stroke-primary/30"
          />
          <path
            d="M0 80 L80 120 L80 200 L0 160"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="stroke-primary/30"
          />
        </g>
        {/* Middle layer - smaller cube */}
        <g transform="translate(180, 40)">
          <path
            d="M0 60 L60 30 L120 60 L60 90 Z"
            className="fill-primary/35 dark:fill-primary/40"
          />
          <path
            d="M60 30 L60 90 L60 150 L60 90"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="stroke-primary/50"
          />
          <path
            d="M60 30 L120 60 L120 120 L60 90"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="stroke-primary/50"
          />
          <path
            d="M0 60 L60 90 L60 150 L0 120"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="stroke-primary/50"
          />
        </g>
        {/* Front layer - smallest cube */}
        <g transform="translate(240, 160)">
          <path
            d="M0 50 L50 25 L100 50 L50 75 Z"
            className="fill-primary/50 dark:fill-primary/55"
          />
          <path
            d="M50 25 L50 75 L50 125 L50 75"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="stroke-primary/60"
          />
          <path
            d="M50 25 L100 50 L100 100 L50 75"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="stroke-primary/60"
          />
          <path
            d="M0 50 L50 75 L50 125 L0 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="stroke-primary/60"
          />
        </g>
        {/* Accent square */}
        <rect
          x="40"
          y="200"
          width="64"
          height="64"
          rx="8"
          className="fill-primary/25 dark:fill-primary/30"
          transform="rotate(-15 72 232)"
        />
        {/* Grid line accents */}
        <line
          x1="0"
          y1="260"
          x2="400"
          y2="260"
          stroke="currentColor"
          strokeWidth="0.5"
          className="stroke-primary/10"
        />
        <line
          x1="0"
          y1="280"
          x2="320"
          y2="280"
          stroke="currentColor"
          strokeWidth="0.5"
          className="stroke-primary/10"
        />
      </svg>
      {/* Glow overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full bg-primary/5 blur-3xl"
        aria-hidden
      />
    </div>
  )
}
