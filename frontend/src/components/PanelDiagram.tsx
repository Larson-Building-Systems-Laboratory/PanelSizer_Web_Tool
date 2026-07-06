import colors from '@/lib/colors';
import type { Phase } from '@/api/panelSizer';

interface Props {
  phase: Phase;
  breakerAmps?: number;
  conductorSize: string;
  neutralSize: string;
  groundSize: string;
  material: 'copper' | 'aluminum';
}

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
        rx={4}
        fill="white"
        stroke={colors.headerFrom}
        strokeWidth={1.5}
        strokeDasharray="5,4"
      />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fill={colors.red}
        fontSize={20}
        fontWeight={700}
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
    <svg viewBox={`0 0 ${WIDTH} ${svgHeight}`} className="w-full h-auto" role="img" aria-label="Service panel wiring schematic">
      <rect
        x={4} y={4}
        width={WIDTH - 8} height={svgHeight - 8}
        fill="none"
        stroke={colors.text}
        strokeWidth={3}
      />

      {breakerAmps !== undefined && (
        <DashedLabel cx={CENTER_X} cy={breakerLabelY} text={`${breakerAmps} A / ${poles}P`} />
      )}

      <line x1={CENTER_X} y1={breakerPeakY} x2={CENTER_X} y2={phaseYs[phaseYs.length - 1] - HUMP_HEIGHT} stroke={colors.text} strokeWidth={2.5} />

      {phaseLetters.map((letter, i) => {
        const y = phaseYs[i];
        return (
          <g key={letter}>
            <text x={LINE_START_X - 35} y={y} fontSize={26} fontWeight={700} fill={colors.text} dominantBaseline="central">
              {letter}
            </text>
            <line x1={LINE_START_X} y1={y} x2={BREAKER_X1} y2={y} stroke={colors.text} strokeWidth={3} />
            <path
              d={`M ${BREAKER_X1},${y} Q ${BREAKER_X1 + 30},${y - HUMP_HEIGHT} ${CENTER_X},${y - HUMP_HEIGHT} Q ${BREAKER_X2 - 30},${y - HUMP_HEIGHT} ${BREAKER_X2},${y}`}
              fill="none"
              stroke={colors.text}
              strokeWidth={3}
            />
            <line x1={BREAKER_X2} y1={y} x2={LINE_END_X} y2={y} stroke={colors.text} strokeWidth={3} />
            <DashedLabel cx={LABEL_BOX_CX} cy={y - LABEL_LINE_GAP} text={conductorLabel} />
          </g>
        );
      })}

      <g>
        <text x={LINE_START_X - 35} y={neutralY} fontSize={26} fontWeight={700} fill={colors.text} dominantBaseline="central">N</text>
        <line x1={LINE_START_X} y1={neutralY} x2={LINE_END_X} y2={neutralY} stroke={colors.text} strokeWidth={3} />
        <DashedLabel cx={LABEL_BOX_CX} cy={neutralY - LABEL_LINE_GAP} text={neutralLabel} />
      </g>

      <g>
        <line x1={GROUND_STUB_X} y1={neutralY} x2={GROUND_STUB_X} y2={groundStubBottomY} stroke={colors.text} strokeWidth={3} />
        <line x1={GROUND_STUB_X - 16} y1={groundStubBottomY} x2={GROUND_STUB_X + 16} y2={groundStubBottomY} stroke={colors.text} strokeWidth={3} />
        <line x1={GROUND_STUB_X - 10} y1={groundStubBottomY + 7} x2={GROUND_STUB_X + 10} y2={groundStubBottomY + 7} stroke={colors.text} strokeWidth={3} />
        <line x1={GROUND_STUB_X - 4} y1={groundStubBottomY + 14} x2={GROUND_STUB_X + 4} y2={groundStubBottomY + 14} stroke={colors.text} strokeWidth={3} />
        <text x={GROUND_STUB_X - 32} y={groundLabelY} fontSize={26} fontWeight={700} fill={colors.text} dominantBaseline="central">G</text>
        <DashedLabel cx={GROUND_STUB_X + 25 + LABEL_BOX_W / 2} cy={groundLabelY} text={groundLabel} />
      </g>
    </svg>
  );
}
