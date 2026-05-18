function lineClass(line: string): string {
  const l = line.toLowerCase();
  if (l.startsWith('calculating'))                              return 'text-log-header font-semibold';
  if (l.includes('demand factor') || l.includes('reduced to')) return 'text-yellow';
  if (l.includes('total') && l.includes('load'))               return 'text-green';
  return 'text-log-normal';
}

export default function CalculationLog({ log }: { log: string[] }) {
  return (
    <section className="bg-bg-card border border-border rounded-lg shadow-sm overflow-hidden [animation:fadeIn_0.3s_ease_0.1s_both]">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-bg-card-hover">
        <h2 className="text-sm font-semibold text-text">Calculation Log</h2>
        <span className="ml-auto text-xs text-muted">{log.length} lines</span>
      </div>
      <div className="p-5">
        <div className="max-h-96 overflow-y-auto rounded border border-border font-mono text-xs">
          {log.map((line, i) => (
            <div
              key={i}
              className={`flex items-baseline gap-3 px-3 py-1.5 border-b border-log-row-border last:border-b-0 leading-relaxed ${i % 2 === 0 ? 'bg-log-odd' : 'bg-white'} ${lineClass(line)}`}
            >
              <span className="min-w-[1.4rem] text-[10px] text-log-index text-right select-none">{i + 1}</span>
              <span>{line}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
