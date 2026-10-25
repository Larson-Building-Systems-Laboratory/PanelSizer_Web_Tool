import type { Phase } from '@/api/panelSizer';

interface Props {
  phase: Phase;
  breakerAmps?: number | null;
  conductorSize: string;
  neutralSize: string;
  groundSize: string;
  material: 'copper' | 'aluminum';
}

// BEST Center palette (see DESIGN.md)
const INK = '#161616';
const ACTION = '#126000';
const BRAND = '#00964f';
const HAIRLINE = '#c8c8c8';

const WIDTH = 900;
const LINE_START_X = 90;
const LINE_END_X = 800;
const BREAKER_X1 = 260;
const BREAKER_X2 = 380;
const CENTER_X = (BREAKER_X1 + BREAKER_X2) / 2;
const HUMP_HEIGHT = 42;
const ROW_GAP = 68;
const TOP_Y = 130;
const LABEL_BOX_CX = 640;
const LABEL_BOX_W = 210;
const LABEL_BOX_H = 46;
const GROUND_STUB_X = 240;
// Distance from a wire's y to the center of the label box sitting on top of it
const LABEL_LINE_GAP = LABEL_BOX_H / 2 + 8;

function DashedLabel({ cx, cy, text }: { cx: number; cy: number; text: string }) {
  return (
    <g>
      <rect
        x={cx - LABEL_BOX_W / 2}
        y={cy - LABEL_BOX_H / 2}
        width={LABEL_BOX_W}
        height={LABEL_BOX_H}
        rx={11}
        fill="white"
        stroke={BRAND}
        strokeWidth={1.5}
        strokeDasharray="5,4"
      />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fill={ACTION}
        fontSize={20}
        fontWeight={600}
      >
        {text}
      </text>
    </g>
  );
}

export default function PanelDiagram({ phase, breakerAmps, conductorSize, neutralSize, groundSize, material }: Props) {
  const abbrev = material === 'copper' ? 'Cu' : 'Al';
  const phaseLetters = phase === 3 ? ['A', 'B', 'C'] : ['A', 'B'];
  const poles = phase === 3 ? 3 : 2;

  const phaseYs = phaseLetters.map((_, i) => TOP_Y + i * ROW_GAP);
  const neutralY = TOP_Y + phaseLetters.length * ROW_GAP;
  const groundStubBottomY = neutralY + 80;
  const groundLabelY = neutralY + 45;
  const svgHeight = groundStubBottomY + 60;

  const breakerPeakY = phaseYs[0] - HUMP_HEIGHT;
  const breakerLabelY = breakerPeakY - 40;

  const conductorLabel = `${conductorSize} (${abbrev})`;
  const neutralLabel = `${neutralSize} (${abbrev})`;
  const groundLabel = `${groundSize} (${abbrev})`;

  return (
    <svg viewBox={`0 0 ${WIDTH} ${svgHeight}`} className="w-full h-auto max-sm:min-w-[560px] font-sans" role="img" aria-label="Service panel wiring schematic">
      <rect
        x={4} y={4}
        width={WIDTH - 8} height={svgHeight - 8}
        rx={14}
        fill="none"
        stroke={HAIRLINE}
        strokeWidth={2}
      />

      {breakerAmps != null && (
        <DashedLabel cx={CENTER_X} cy={breakerLabelY} text={`${breakerAmps} A / ${poles}P`} />
      )}

      <line x1={CENTER_X} y1={breakerPeakY} x2={CENTER_X} y2={phaseYs[phaseYs.length - 1] - HUMP_HEIGHT} stroke={INK} strokeWidth={2.5} />

      {phaseLetters.map((letter, i) => {
        const y = phaseYs[i];
        return (
          <g key={letter}>
            <text x={LINE_START_X - 35} y={y} fontSize={26} fontWeight={600} fill={INK} dominantBaseline="central">
              {letter}
            </text>
            <line x1={LINE_START_X} y1={y} x2={BREAKER_X1} y2={y} stroke={INK} strokeWidth={3} />
            <path
              d={`M ${BREAKER_X1},${y} Q ${BREAKER_X1 + 30},${y - HUMP_HEIGHT} ${CENTER_X},${y - HUMP_HEIGHT} Q ${BREAKER_X2 - 30},${y - HUMP_HEIGHT} ${BREAKER_X2},${y}`}
              fill="none"
              stroke={INK}
              strokeWidth={3}
            />
            <line x1={BREAKER_X2} y1={y} x2={LINE_END_X} y2={y} stroke={INK} strokeWidth={3} />
            <DashedLabel cx={LABEL_BOX_CX} cy={y - LABEL_LINE_GAP} text={conductorLabel} />
          </g>
        );
      })}

      <g>
        <text x={LINE_START_X - 35} y={neutralY} fontSize={26} fontWeight={600} fill={INK} dominantBaseline="central">N</text>
        <line x1={LINE_START_X} y1={neutralY} x2={LINE_END_X} y2={neutralY} stroke={INK} strokeWidth={3} />
        <DashedLabel cx={LABEL_BOX_CX} cy={neutralY - LABEL_LINE_GAP} text={neutralLabel} />
      </g>

      <g>
        <line x1={GROUND_STUB_X} y1={neutralY} x2={GROUND_STUB_X} y2={groundStubBottomY} stroke={INK} strokeWidth={3} />
        <line x1={GROUND_STUB_X - 16} y1={groundStubBottomY} x2={GROUND_STUB_X + 16} y2={groundStubBottomY} stroke={INK} strokeWidth={3} />
        <line x1={GROUND_STUB_X - 10} y1={groundStubBottomY + 7} x2={GROUND_STUB_X + 10} y2={groundStubBottomY + 7} stroke={INK} strokeWidth={3} />
        <line x1={GROUND_STUB_X - 4} y1={groundStubBottomY + 14} x2={GROUND_STUB_X + 4} y2={groundStubBottomY + 14} stroke={INK} strokeWidth={3} />
        <text x={GROUND_STUB_X - 32} y={groundLabelY} fontSize={26} fontWeight={600} fill={INK} dominantBaseline="central">G</text>
        <DashedLabel cx={GROUND_STUB_X + 25 + LABEL_BOX_W / 2} cy={groundLabelY} text={groundLabel} />
      </g>
    </svg>
  );
}
