'use client';

import { useEffect, useRef, useState } from 'react';
import DwellingForm, { type DwellingValues } from '@/components/DwellingForm';
import ApplianceList, { newAppliance, type Appliance } from '@/components/ApplianceList';
import ResultsPanel from '@/components/ResultsPanel';
import { calculatePanel, type CalculateResult } from '@/api/panelSizer';

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
    <div className="flex flex-col">

      {/* Top header bar */}
      <header className="bg-gradient-to-r from-header-from to-header-to px-8 py-4 max-sm:px-4 max-sm:py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="w-9 h-9 rounded bg-blue flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-white text-lg font-bold tracking-tight leading-tight">Panel Sizer</h1>
            <p className="text-header-sub text-[11px] leading-tight">NEC Residential Service Entrance Calculator</p>
          </div>
        </div>
      </header>

      {/* Step navigation */}
      <nav className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-8 flex max-sm:px-2 max-sm:justify-between">
          {STEPS.map((step, idx) => {
            const isDone = step.id < activeStep;
            const isActive = step.id === activeStep;
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-2 px-4 py-3.5 text-sm border-b-2 transition-colors max-sm:px-2 max-sm:py-3 max-sm:whitespace-nowrap ${
                  isActive
                    ? 'border-b-blue text-blue font-semibold'
                    : isDone
                    ? 'border-b-green text-green font-medium'
                    : 'border-b-[transparent] text-muted'
                }`}>
                  <span className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center flex-shrink-0 ${
                    isActive ? 'bg-blue text-white' : isDone ? 'bg-green text-white' : 'bg-border text-muted'
                  }`}>{step.id}</span>
                  <span className={isActive ? undefined : 'max-sm:hidden'}>{step.label}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <svg className="text-border flex-shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto w-full px-8 py-6 grid grid-cols-[480px_1fr] gap-6 items-start max-[900px]:grid-cols-1 max-sm:px-4 max-sm:py-4 max-sm:gap-4">
        <form className="flex flex-col gap-4" onSubmit={calculate}>
          <DwellingForm values={dwelling} onChange={updateDwelling} />
          <ApplianceList
            appliances={appliances}
            phase={dwelling.phase}
            onAdd={addAppliance}
            onChange={updateAppliance}
            onRemove={removeAppliance}
          />
          {error && (
            <div className="bg-error-bg border border-error-border rounded-lg text-error-text text-sm px-4 py-3">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue text-white font-semibold text-sm rounded-lg py-3 px-6 max-sm:py-3.5 max-sm:text-base w-full cursor-pointer hover:opacity-90 hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Calculating…' : 'Calculate Panel Size'}
          </button>
        </form>

        <div ref={resultsRef} className="flex flex-col gap-4 min-w-0 scroll-mt-4">
          {!results && !loading && (
            <div className="bg-bg-card border border-border rounded-lg py-16 px-8 max-sm:py-10 max-sm:px-5 text-center shadow-sm">
              <div className="w-14 h-14 rounded-full bg-blue-light flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/>
                </svg>
              </div>
              <p className="text-sm text-muted max-w-xs mx-auto">
                Fill in the dwelling details and appliances, then click{' '}
                <strong className="text-text">Calculate Panel Size</strong> to see results.
              </p>
            </div>
          )}
          {loading && (
            <div className="bg-bg-card border border-border rounded-lg py-16 px-8 max-sm:py-10 max-sm:px-5 text-center shadow-sm">
              <div className="w-9 h-9 rounded-full border-[3px] border-border border-t-blue mx-auto mb-4 animate-spin" />
              <p className="text-sm text-muted">Running NEC calculations…</p>
            </div>
          )}
          {results && <ResultsPanel results={results} />}
        </div>
      </main>
    </div>
  );
}
