interface Props {
  log: string[];
}

interface Section {
  title: string;
  steps: string[];
  result?: string;
}

function groupLog(log: string[]): Section[] {
  const sections: Section[] = [];
  let current: Section | null = null;

  for (const raw of log) {
    const line = raw.trimEnd();
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.endsWith('...')) {
      current = { title: trimmed.replace(/\s*\.\.\.$/, ''), steps: [] };
      sections.push(current);
      continue;
    }
    if (!current) {
      current = { title: 'Calculation', steps: [] };
      sections.push(current);
    }
    if (line.startsWith('  ')) {
      current.result = trimmed;
    } else {
      current.steps.push(trimmed);
    }
  }
  return sections;
}

const NUMBER_RE = /(-?[\d,]+(?:\.\d+)?\s?(?:VA|A|%))/g;

function Highlighted({ text }: { text: string }) {
  const parts = text.replace(/->/g, '→').split(NUMBER_RE);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="font-mono font-semibold text-text">{part}</span>
        ) : (
          part
        )
      )}
    </>
  );
}

export default function CalculationLog({ log }: Props) {
  if (!log || log.length === 0) return null;

  const sections = groupLog(log);

  return (
    <div className="px-5 pb-5 max-sm:px-4 max-sm:pb-4">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted mb-3">
        Calculation Log
      </h3>

      <div className="border border-border rounded-lg overflow-hidden bg-white">
        {sections.map((section, si) => (
          <div
            key={si}
            className={`px-4 py-3 ${si % 2 === 1 ? 'bg-log-odd' : ''} ${
              si > 0 ? 'border-t border-log-row-border' : ''
            }`}
          >
            <h4 className="text-xs font-bold text-log-header mb-2">{section.title}</h4>
            <ul className="space-y-1.5">
              {section.steps.map((step, li) => (
                <li
                  key={li}
                  className="text-xs text-log-normal pl-3 border-l-2 border-log-row-border leading-relaxed"
                >
                  <Highlighted text={step} />
                </li>
              ))}
            </ul>
            {section.result && (
              <div className="mt-2 pt-2 border-t border-log-row-border text-xs font-semibold text-text">
                <Highlighted text={section.result} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
