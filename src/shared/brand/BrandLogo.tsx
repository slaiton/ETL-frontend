import { useId } from "react";

/**
 * Logo "Analytics by TF" recreado en SVG a partir del arte original
 * (mismas proporciones, medidas sobre el lienzo de 2000×667).
 *
 * - tone="onDark"  → texto blanco (fondos oscuros o azules)
 * - tone="onLight" → texto tinta (fondos blancos)
 * - monochrome     → barras en blanco (para fondos con el degradado de marca)
 * - variant="mark" → solo el ícono de barras
 */
interface BrandLogoProps {
  variant?: "full" | "mark";
  tone?: "onDark" | "onLight";
  monochrome?: boolean;
  height?: number;
  className?: string;
  title?: string;
}

const TONES = {
  onDark:  { ink: "#FFFFFF", muted: "#D6DEE8", divider: "rgba(220,227,236,0.85)" },
  onLight: { ink: "#0F172A", muted: "#64748B", divider: "#CBD5E1" },
} as const;

/* Cada barra va de cian (arriba) a un azul más profundo cuanto más alta es */
const BARS = [
  { x: 188, y: 277, h: 98,  end: "#0096F6" },
  { x: 278, y: 223, h: 152, end: "#0078F6" },
  { x: 368, y: 157, h: 218, end: "#005FF9" },
];

const FULL_VIEWBOX = { x: 180, y: 150, w: 1650, h: 420 };
const MARK_VIEWBOX = { x: 180, y: 150, w: 275, h: 235 };

export default function BrandLogo({
  variant = "full",
  tone = "onDark",
  monochrome = false,
  height = 40,
  className,
  title = "Analytics by Tecnología Funcional",
}: BrandLogoProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const c = TONES[tone];
  const vb = variant === "mark" ? MARK_VIEWBOX : FULL_VIEWBOX;
  const width = (height * vb.w) / vb.h;

  return (
    <svg
      viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label={title}
      style={{ display: "block", flexShrink: 0 }}
    >
      <title>{title}</title>
      {!monochrome && (
        <defs>
          {BARS.map((b, i) => (
            <linearGradient key={i} id={`${uid}-bar${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#00E5EC" />
              <stop offset="1" stopColor={b.end} />
            </linearGradient>
          ))}
        </defs>
      )}

      {BARS.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={b.y}
          width={78}
          height={b.h}
          rx={16}
          fill={monochrome ? "#FFFFFF" : `url(#${uid}-bar${i})`}
        />
      ))}

      {variant === "full" && (
        <>
          <rect x={509} y={163} width={8} height={221} rx={4} fill={c.divider} />
          <text
            x={572}
            y={370}
            fill={c.ink}
            fontFamily="Montserrat, 'Segoe UI', system-ui, sans-serif"
            fontWeight={700}
            fontSize={288}
            textLength={1251}
            lengthAdjust="spacingAndGlyphs"
          >
            Analytics
          </text>
          <text
            x={1573}
            y={490}
            fill={c.muted}
            fontFamily="Montserrat, 'Segoe UI', system-ui, sans-serif"
            fontStyle="italic"
            fontWeight={500}
            fontSize={68}
            textLength={80}
            lengthAdjust="spacingAndGlyphs"
          >
            by
          </text>
          {/* Marca TF */}
          <g fill={c.ink}>
            <rect x={1728} y={413} width={82} height={27} />
            <rect x={1683} y={452} width={127} height={28} />
            <rect x={1733} y={480} width={29} height={80} />
          </g>
        </>
      )}
    </svg>
  );
}
