import type { CalculateResult } from '@/api/panelSizer';

interface CardProps {
  title: string;
  rating?: number;
  conductorSize: string;
  borderClass: string;
  bgClass: string;
}

function ResultCard({ title, rating, conductorSize, borderClass, bgClass }: CardProps) {
  return (
    <div className={`${bgClass} border border-border border-l-4 ${borderClass} rounded-lg p-4`}>
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted mb-3">{title}</h3>
      {rating !== undefined && (
        <div className="flex justify-between items-baseline gap-2 text-sm py-1.5 border-b border-border">
          <span className="text-muted">Service Rating</span>
          <span className="font-bold text-text">{rating} A</span>
        </div>
      )}
      <div className="flex justify-between items-baseline gap-2 text-sm pt-1.5">
        <span className="text-muted">Conductor Size</span>
        <span className="font-mono text-base font-bold text-text">{conductorSize}</span>
      </div>
    </div>
  );
}

export default function ResultsPanel({ results }: { results: CalculateResult }) {
  const { service, neutral, grounding_conductor_size, method } = results;

  return (
    <section className="bg-bg-card border border-border rounded-lg shadow-sm overflow-hidden [animation:fadeIn_0.3s_ease]">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-bg-card-hover">
        <h2 className="text-sm font-semibold text-text">Results Summary</h2>
        <span className="text-xs bg-blue-light text-blue px-2.5 py-0.5 rounded-full font-semibold">
          {method} Method
        </span>
        <span className="ml-auto text-xs bg-green-light text-green px-2.5 py-0.5 rounded-full font-semibold">
          Calculated
        </span>
      </div>
      <div className="p-5 grid grid-cols-3 gap-4">
        <ResultCard
          title="Service Entrance"
          rating={service.service_rating}
          conductorSize={service.conductor_size}
          borderClass="border-l-blue"
          bgClass="bg-blue-light"
        />
        <ResultCard
          title="Neutral Conductor"
          conductorSize={neutral.conductor_size}
          borderClass="border-l-green"
          bgClass="bg-green-light"
        />
        <ResultCard
          title="Grounding"
          conductorSize={grounding_conductor_size}
          borderClass="border-l-orange"
          bgClass="bg-orange-light"
        />
      </div>
    </section>
  );
}
