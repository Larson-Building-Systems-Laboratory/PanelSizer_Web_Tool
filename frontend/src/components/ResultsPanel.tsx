import type { CalculateResult } from '@/api/panelSizer';

interface CardProps {
  title: string;
  rating?: number;
  conductorSize: string;
  accentClass: string;
}

function ResultCard({ title, rating, conductorSize, accentClass }: CardProps) {
  return (
    <div className={`bg-bg border border-border border-t-[3px] rounded-xl p-4 ${accentClass}`}>
      <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted mb-3">{title}</h3>
      {rating !== undefined && (
        <div className="flex justify-between items-baseline gap-2 text-sm py-1">
          <span className="text-muted whitespace-nowrap">Service Rating</span>
          <span className="font-semibold text-text">{rating} A</span>
        </div>
      )}
      <div className="flex justify-between items-baseline gap-2 text-sm py-1">
        <span className="text-muted whitespace-nowrap">Conductor Size</span>
        <span className="font-mono text-base font-semibold text-text">{conductorSize}</span>
      </div>
    </div>
  );
}

export default function ResultsPanel({ results }: { results: CalculateResult }) {
  const { service, neutral, grounding_conductor_size } = results;

  return (
    <section className="bg-bg-card border border-border rounded-xl p-5 shadow-lg [animation:fadeIn_0.3s_ease]">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted mb-4">Results</h2>
      <div className="grid grid-cols-3 gap-4">
        <ResultCard title="Service Entrance"   rating={service.service_rating}  conductorSize={service.conductor_size}          accentClass="border-t-blue" />
        <ResultCard title="Neutral Conductor"  rating={neutral.service_rating}  conductorSize={neutral.conductor_size}          accentClass="border-t-green" />
        <ResultCard title="Grounding Conductor"                                 conductorSize={grounding_conductor_size}        accentClass="border-t-orange" />
      </div>
    </section>
  );
}
