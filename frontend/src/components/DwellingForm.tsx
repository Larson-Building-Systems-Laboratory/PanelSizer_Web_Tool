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

const inputCls = 'field nums w-full px-3 py-2 text-[15px] text-body max-sm:text-base';

const labelCls = 'block text-[13px] font-medium text-body mb-1.5';

const chipCls = 'chip flex items-center gap-2 px-3.5 py-2 text-[14px] text-body cursor-pointer select-none';

export default function DwellingForm({ values, onChange }: Props) {
  return (
    <section className="card">
      <div className="flex items-center gap-3 px-6 pt-6 max-sm:px-4 max-sm:pt-5">
        <span className="nums w-7 h-7 rounded-full bg-mint text-primary text-[13px] font-semibold flex items-center justify-center shrink-0">1</span>
        <h2 className="text-[21px] tracking-[-0.2px]">Dwelling Info</h2>
      </div>

      <div className="p-6 pt-5 max-sm:p-4">
        <div className="grid grid-cols-3 gap-3 mb-5 max-sm:grid-cols-2">
          <div className="max-sm:col-span-2">
            <label className={labelCls}>
              Floor Area (sq ft) <span className="text-error font-normal">*</span>
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

        <div className="mb-5">
          <label className={labelCls}>Service Type</label>
          <div className="flex flex-wrap gap-2">
            {([
              { value: 1 as const, label: 'Single-Phase (120/240 V)' },
              { value: 3 as const, label: 'Three-Phase (120/208 V)' },
            ]).map(opt => (
              <label key={opt.value} className={`${chipCls} ${values.phase === opt.value ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="phase"
                  value={opt.value}
                  checked={values.phase === opt.value}
                  onChange={() => onChange('phase', opt.value)}
                  className="accent-[var(--color-primary)]"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className={labelCls}>Conductor Material</label>
          <div className="flex flex-wrap gap-2">
            {(['copper', 'aluminum'] as const).map(m => (
              <label key={m} className={`${chipCls} ${values.material === m ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="material"
                  value={m}
                  checked={values.material === m}
                  onChange={() => onChange('material', m)}
                  className="accent-[var(--color-primary)]"
                />
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCls}>Calculation Method</label>
          <div className="flex flex-wrap gap-2">
            {(['Standard', 'Optional'] as const).map(m => (
              <label key={m} className={`${chipCls} ${values.method === m ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="method"
                  value={m}
                  checked={values.method === m}
                  onChange={() => onChange('method', m)}
                  className="accent-[var(--color-primary)]"
                />
                {m}
              </label>
            ))}
          </div>
          <p key={values.method} className="animate-settle text-[13px] text-muted mt-2">
            {values.method === 'Standard'
              ? 'NEC Art. 220 — sizes phases and neutral separately for every load category.'
              : 'NEC 220.82 — sizes phase conductors only (neutral still uses the Standard method).'}
          </p>
        </div>
      </div>
    </section>
  );
}
