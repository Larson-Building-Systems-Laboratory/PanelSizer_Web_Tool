'use client';

import { useState } from 'react';
import DwellingForm, { type DwellingValues } from '@/components/DwellingForm';
import ApplianceList, { newAppliance, type Appliance } from '@/components/ApplianceList';
import CalculationLog from '@/components/CalculationLog';
import ResultsPanel from '@/components/ResultsPanel';
import { calculatePanel, type CalculateResult } from '@/api/panelSizer';

const DEFAULTS: DwellingValues = {
  squareFeet: '',
  kitchenCircuits: 2,
  laundryCircuits: 1,
  material: 'copper',
};

export default function Page() {
  const [dwelling, setDwelling] = useState<DwellingValues>(DEFAULTS);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<CalculateResult | null>(null);

  function updateDwelling(field: keyof DwellingValues, value: string | number) {
    setDwelling(prev => ({ ...prev, [field]: value }));
  }

  function addAppliance() {
    setAppliances(prev => [...prev, newAppliance()]);
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
    <div>
      <header className="border-b border-border px-8 py-4 bg-gradient-to-br from-header-from to-header-to">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <span className="text-4xl leading-none">⚡</span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text">Panel Sizer</h1>
            <p className="text-xs text-muted mt-0.5">NEC Residential Service Entrance Calculator</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-6 grid grid-cols-[420px_1fr] gap-6 items-start max-[900px]:grid-cols-1">
        <form className="flex flex-col gap-4" onSubmit={calculate}>
          <DwellingForm values={dwelling} onChange={updateDwelling} />
          <ApplianceList
            appliances={appliances}
            onAdd={addAppliance}
            onChange={updateAppliance}
            onRemove={removeAppliance}
          />
          {error && (
            <div className="bg-error-bg border border-error-border rounded-xl text-error-text text-sm px-4 py-3">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue text-text font-semibold text-sm rounded-xl py-3 px-6 w-full cursor-pointer hover:opacity-90 hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Calculating…' : 'Calculate Panel Size'}
          </button>
        </form>

        <div className="flex flex-col gap-4">
          {!results && !loading && (
            <div className="bg-bg-card border border-border rounded-xl py-12 px-8 text-center text-muted text-sm">
              <div className="text-4xl mb-4">📋</div>
              <p>Fill in the dwelling details and appliances, then click <strong className="text-text">Calculate Panel Size</strong> to see results.</p>
            </div>
          )}
          {loading && (
            <div className="bg-bg-card border border-border rounded-xl py-12 px-8 text-center text-muted text-sm">
              <div className="w-9 h-9 rounded-full border-[3px] border-border border-t-blue mx-auto mb-4 animate-spin" />
              <p>Running NEC calculations…</p>
            </div>
          )}
          {results && (
            <>
              <ResultsPanel results={results} />
              <CalculationLog log={results.log} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
