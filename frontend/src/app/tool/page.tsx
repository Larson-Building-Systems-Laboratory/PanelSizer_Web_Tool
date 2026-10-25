'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import DwellingForm, { type DwellingValues } from '@/components/DwellingForm';
import ApplianceList, { newAppliance, type Appliance } from '@/components/ApplianceList';
import ResultsPanel from '@/components/ResultsPanel';
import { calculatePanel, type CalculateResult } from '@/api/panelSizer';
import { SiteNav } from '@/components/SiteFrame';

const DEFAULTS: DwellingValues = {
  squareFeet: '',
  kitchenCircuits: 2,
  laundryCircuits: 1,
  material: 'copper',
  method: 'Standard',
  phase: 1,
};

const STEPS = [
  { id: 1, label: 'Dwelling Info' },
  { id: 2, label: 'Appliances' },
  { id: 3, label: 'Calculate' },
  { id: 4, label: 'Results' },
];

export default function Page() {
  const [dwelling, setDwelling] = useState<DwellingValues>(DEFAULTS);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<CalculateResult | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  const activeStep = results ? 4 : loading ? 3 : appliances.length > 0 ? 2 : 1;

  // On the stacked (single-column) layout the results render below the form, so bring them into view
  useEffect(() => {
    if (results && window.matchMedia('(max-width: 900px)').matches) {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [results]);

  function updateDwelling(field: keyof DwellingValues, value: string | number) {
    setDwelling(prev => ({ ...prev, [field]: value }));

    if (field === 'phase') {
      const secondaryVoltage = value === 3 ? 208 : 240;
      setAppliances(prev => prev.map(a => a.voltage === 120 ? a : { ...a, voltage: secondaryVoltage }));
    }
  }

  function addAppliance() {
    setAppliances(prev => [...prev, newAppliance(dwelling.phase)]);
  }

  function updateAppliance(id: string, field: keyof Appliance, value: string | number) {
    setAppliances(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  }

  function removeAppliance(id: string) {
    setAppliances(prev => prev.filter(a => a.id !== id));
  }

  async function calculate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResults(null);
    setLoading(true);

    try {
      const data = await calculatePanel({
        square_feet: Number(dwelling.squareFeet),
        kitchen_circuits: Number(dwelling.kitchenCircuits),
        laundry_circuits: Number(dwelling.laundryCircuits),
        material: dwelling.material,
        method: dwelling.method,
        phase: dwelling.phase,
        appliances: appliances.map(a => ({
          name: a.name,
          power_watts: Number(a.powerWatts),
          voltage: a.voltage,
        })),
      });
      setResults(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-mist">
      <SiteNav>
        <Link
          href="/"
          className="text-[13px] text-muted hover:text-body transition-colors"
        >
          Home
        </Link>
      </SiteNav>

      {/* Step progress */}
      <nav aria-label="Progress" className="bg-canvas border-b border-hairline">
        <ol className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 overflow-x-auto max-sm:px-4">
          {STEPS.map((step, idx) => {
            const isDone = step.id < activeStep;
            const isActive = step.id === activeStep;
            return (
              <li key={step.id} className="flex items-center gap-2 shrink-0">
                <span
                  aria-current={isActive ? 'step' : undefined}
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[14px] transition-colors duration-300 ${
                    isActive ? 'bg-mint text-ink font-semibold' : isDone ? 'text-primary' : 'text-muted'
                  }`}
                >
                  <span className={`nums w-5 h-5 rounded-full text-[11px] font-semibold flex items-center justify-center transition-colors duration-300 ${
                    isActive || isDone ? 'bg-primary text-white' : 'bg-mist text-muted'
                  }`}>
                    {isDone ? '✓' : step.id}
                  </span>
                  <span className={isActive ? undefined : 'max-sm:hidden'}>{step.label}</span>
                </span>
                {idx < STEPS.length - 1 && <span aria-hidden className="w-6 h-px bg-hairline max-sm:w-3" />}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto w-full px-6 py-8 grid grid-cols-[480px_1fr] gap-4 items-start max-[900px]:grid-cols-1 max-sm:px-4 max-sm:py-5">
        <form className="stagger flex flex-col gap-4" onSubmit={calculate}>
          <DwellingForm values={dwelling} onChange={updateDwelling} />
          <ApplianceList
            appliances={appliances}
            phase={dwelling.phase}
            onAdd={addAppliance}
            onChange={updateAppliance}
            onRemove={removeAppliance}
          />
          {error && (
            <div role="alert" className="animate-settle rounded-chip bg-mist text-error text-[14px] px-4 py-3">
              {error}
            </div>
          )}
          <button type="submit" disabled={loading} className="btn btn-primary w-full py-3.5">
            {loading ? 'Calculating…' : 'Calculate Panel Size'}
          </button>
        </form>

        <div ref={resultsRef} className="flex flex-col gap-4 min-w-0 scroll-mt-20 min-[901px]:sticky min-[901px]:top-[76px]">
          {!results && !loading && (
            <div className="card animate-fade py-16 px-8 max-sm:py-10 max-sm:px-5 text-center">
              <div className="w-14 h-14 rounded-full bg-mint flex items-center justify-center mx-auto mb-5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary" aria-hidden>
                  <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/>
                </svg>
              </div>
              <p className="text-[21px] font-semibold tracking-[-0.2px] text-ink">Ready when you are.</p>
              <p className="mt-2 text-[15px] text-muted max-w-xs mx-auto">
                Fill in the dwelling details and appliances, then click{' '}
                <strong className="text-body">Calculate Panel Size</strong> to see results.
              </p>
            </div>
          )}
          {loading && (
            <div className="card animate-fade py-16 px-8 max-sm:py-10 max-sm:px-5 text-center">
              <div className="w-9 h-9 rounded-full border-[3px] border-hairline border-t-brand mx-auto mb-4 animate-spin" />
              <p className="text-[15px] text-muted">Running NEC calculations…</p>
            </div>
          )}
          {results && <ResultsPanel results={results} />}
        </div>
      </main>
    </div>
  );
}
