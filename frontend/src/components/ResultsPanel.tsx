import type { CalculateResult } from '@/api/panelSizer';
import PanelDiagram from './PanelDiagram';
import CalculationLog from './CalculationLog';

interface CardProps {
  title: string;
  rating?: number | null;
  conductorSize: string;
  highlight?: boolean;
}

// The service entrance is the headline answer, so it sits on the canopy tile
function ResultCard({ title, rating, conductorSize, highlight = false }: CardProps) {
  return (
    <div className={`rounded-[14px] p-5 ${highlight ? 'on-dark bg-canopy' : 'bg-mist'}`}>
      <h3 className={`text-[13px] font-semibold ${highlight ? 'text-mint' : 'text-muted'}`}>{title}</h3>
      {rating != null && (
        <p className="nums mt-2 text-[40px] font-semibold leading-none tracking-[-0.5px]">
          {rating}
          <span className={`ml-1 text-[17px] font-normal ${highlight ? 'text-mint' : 'text-muted'}`}>A</span>
        </p>
      )}
      <div className={`flex justify-between items-baseline gap-2 text-[14px] ${rating != null ? 'mt-4 pt-3 border-t border-white/15' : 'mt-3'}`}>
        <span className={highlight ? 'text-mint' : 'text-muted'}>Conductor</span>
        <span className={`nums text-[17px] font-semibold ${highlight ? '' : 'text-ink'}`}>{conductorSize}</span>
      </div>
    </div>
  );
}

export default function ResultsPanel({ results }: { results: CalculateResult }) {
  const { service, neutral, grounding_conductor_size, method, phase, material, log } = results;

  return (
    <section className="card animate-scale-in overflow-hidden">
      <div className="flex items-center gap-3 px-6 pt-6 max-sm:px-4 max-sm:pt-5 max-sm:flex-wrap max-sm:gap-y-2">
        <h2 className="text-[21px] tracking-[-0.2px]">Results</h2>
        <span className="text-[12px] bg-mint text-primary px-2.5 py-1 rounded-full font-semibold">
          {method} Method
        </span>
      </div>
      <div className="stagger p-6 pt-5 grid grid-cols-3 gap-3 max-sm:p-4 max-sm:grid-cols-1">
        <ResultCard
          title="Service Entrance"
          rating={service.service_rating}
          conductorSize={service.conductor_size}
          highlight
        />
        <ResultCard
          title="Neutral Conductor"
          conductorSize={neutral.conductor_size}
        />
        <ResultCard
          title="Grounding"
          conductorSize={grounding_conductor_size}
        />
      </div>
      <div className="px-6 pb-6 max-sm:px-4 max-sm:pb-4">
        <h3 className="text-[15px] font-semibold text-ink mb-3">
          {phase === 3 ? 'Three-Phase (120/208 V)' : 'Single-Phase (120/240 V)'} Wiring Schematic
        </h3>
        <div className="border border-hairline rounded-chip p-4 bg-canvas max-sm:p-2 max-sm:overflow-x-auto">
          <PanelDiagram
            phase={phase}
            breakerAmps={service.service_rating}
            conductorSize={service.conductor_size}
            neutralSize={neutral.conductor_size}
            groundSize={grounding_conductor_size}
            material={material}
          />
        </div>
        <p className="hidden max-sm:block text-[12px] text-muted mt-1.5">Swipe sideways to see the full schematic.</p>
      </div>
      <CalculationLog log={log} />
    </section>
  );
}
