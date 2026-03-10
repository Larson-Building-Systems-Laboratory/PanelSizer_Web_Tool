export interface DwellingValues {
  squareFeet: string;
  kitchenCircuits: number;
  laundryCircuits: number;
  material: 'copper' | 'aluminum';
}

interface Props {
  values: DwellingValues;
  onChange: (field: keyof DwellingValues, value: string | number) => void;
}

const inputCls =
  'bg-bg border border-border rounded-md text-text text-sm px-2.5 py-2 w-full outline-none focus:border-blue transition-colors';

export default function DwellingForm({ values, onChange }: Props) {
  return (
    <section className="bg-bg-card border border-border rounded-xl p-5 shadow-lg">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted mb-4">
        Dwelling Info
      </h2>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted">Floor Area (sq ft)</label>
          <input
            type="number"
            min="1"
            className={inputCls}
            value={values.squareFeet}
            onChange={e => onChange('squareFeet', e.target.value)}
            placeholder="e.g. 1600"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted">Kitchen Circuits</label>
          <input
            type="number"
            min="1"
            className={inputCls}
            value={values.kitchenCircuits}
            onChange={e => onChange('kitchenCircuits', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted">Laundry Circuits</label>
          <input
            type="number"
            min="1"
            className={inputCls}
            value={values.laundryCircuits}
            onChange={e => onChange('laundryCircuits', e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1 mt-2">
        <label className="text-xs font-medium text-muted">Conductor Material</label>
        <div className="flex gap-6 mt-1">
          {(['copper', 'aluminum'] as const).map(m => (
            <label key={m} className="flex items-center gap-2 text-sm text-text cursor-pointer">
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
    </section>
  );
}
