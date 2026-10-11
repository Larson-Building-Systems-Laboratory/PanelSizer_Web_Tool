export interface DwellingValues {
  squareFeet: string;
  kitchenCircuits: number;
  laundryCircuits: number;
  material: 'copper' | 'aluminum';
  method: 'Standard' | 'Optional';
  phase: 1 | 3;
}

interface Props {
  values: DwellingValues;
  onChange: (field: keyof DwellingValues, value: string | number) => void;
}

const inputCls =
  'bg-white border border-border rounded text-text text-sm max-sm:text-base px-3 py-2 w-full outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-colors';

const labelCls = 'block text-xs font-semibold text-text mb-1';

export default function DwellingForm({ values, onChange }: Props) {
  return (
    <section className="bg-bg-card border border-border rounded-lg shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 max-sm:px-4 border-b border-border bg-bg-card-hover">
        <span className="w-6 h-6 rounded-full bg-blue text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
        <h2 className="text-sm font-semibold text-text">Dwelling Info</h2>
      </div>

      <div className="p-5 max-sm:p-4">
        <div className="grid grid-cols-3 gap-3 mb-4 max-sm:grid-cols-2">
          <div className="max-sm:col-span-2">
            <label className={labelCls}>
              Floor Area (sq ft) <span className="text-red font-normal">*</span>
            </label>
            <input
              type="number"
              min="1"
              className={inputCls}
              value={values.squareFeet}
              onChange={e => onChange('squareFeet', e.target.value)}
              placeholder="e.g. 1600"
            />
          </div>
          <div>
            <label className={labelCls}>Kitchen Circuits</label>
            <input
              type="number"
              min="1"
              className={inputCls}
              value={values.kitchenCircuits}
              onChange={e => onChange('kitchenCircuits', e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Laundry Circuits</label>
            <input
              type="number"
              min="1"
              className={inputCls}
              value={values.laundryCircuits}
              onChange={e => onChange('laundryCircuits', e.target.value)}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className={labelCls}>Service Type</label>
          <div className="flex gap-6 mt-1.5 max-sm:flex-wrap max-sm:gap-y-2.5">
            {([
              { value: 1 as const, label: 'Single-Phase (120/240 V)' },
              { value: 3 as const, label: 'Three-Phase (120/208 V)' },
            ]).map(opt => (
              <label key={opt.value} className="flex items-center gap-2 text-sm text-text cursor-pointer select-none">
                <input
                  type="radio"
                  name="phase"
                  value={opt.value}
                  checked={values.phase === opt.value}
                  onChange={() => onChange('phase', opt.value)}
                  className="accent-blue"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className={labelCls}>Conductor Material</label>
          <div className="flex gap-6 mt-1.5 max-sm:flex-wrap max-sm:gap-y-2.5">
            {(['copper', 'aluminum'] as const).map(m => (
              <label key={m} className="flex items-center gap-2 text-sm text-text cursor-pointer select-none">
                <input
                  type="radio"
                  name="material"
                  value={m}
                  checked={values.material === m}
                  onChange={() => onChange('material', m)}
                  className="accent-blue"
                />
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCls}>Calculation Method</label>
          <div className="flex gap-6 mt-1.5 max-sm:flex-wrap max-sm:gap-y-2.5">
            {(['Standard', 'Optional'] as const).map(m => (
              <label key={m} className="flex items-center gap-2 text-sm text-text cursor-pointer select-none">
                <input
                  type="radio"
                  name="method"
                  value={m}
                  checked={values.method === m}
                  onChange={() => onChange('method', m)}
                  className="accent-blue"
                />
                {m}
              </label>
            ))}
          </div>
          <p className="text-[11px] text-muted mt-1.5">
            {values.method === 'Standard'
              ? 'NEC Art. 220 — sizes phases and neutral separately for every load category.'
              : 'NEC 220.82 — sizes phase conductors only (neutral still uses the Standard method).'}
          </p>
        </div>
      </div>
    </section>
  );
}
