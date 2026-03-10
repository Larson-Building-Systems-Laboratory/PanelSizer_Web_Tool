function lineClass(line: string): string {
  const l = line.toLowerCase();
  if (l.startsWith('calculating'))                              return 'text-log-header font-semibold';
  if (l.includes('demand factor') || l.includes('reduced to')) return 'text-yellow';
  if (l.includes('total') && l.includes('load'))               return 'text-green';
  return 'text-log-normal';
}

export default function CalculationLog({ log }: { log: string[] }) {
  return (
    <section className="bg-bg-card border border-border rounded-xl p-5 shadow-lg [animation:fadeIn_0.3s_ease_0.1s_both]">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">Calculation Log</h2>
      <div className="max-h-96 overflow-y-auto rounded-md border border-border font-mono text-xs">
        {log.map((line, i) => (
          <div
            key={i}
            className={`flex items-baseline gap-3 px-3 py-1.5 border-b border-log-row-border last:border-b-0 leading-relaxed ${i % 2 === 0 ? 'bg-log-odd' : ''} ${lineClass(line)}`}
          >
            <span className="min-w-[1.4rem] text-[10px] text-log-index text-right select-none">{i + 1}</span>
            <span>{line}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
