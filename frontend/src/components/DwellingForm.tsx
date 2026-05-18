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
  'bg-white border border-border rounded text-text text-sm px-3 py-2 w-full outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-colors';

const labelCls = 'block text-xs font-semibold text-text mb-1';

export default function DwellingForm({ values, onChange }: Props) {
  return (
    <section className="bg-bg-card border border-border rounded-lg shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-bg-card-hover">
        <span className="w-6 h-6 rounded-full bg-blue text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
        <h2 className="text-sm font-semibold text-text">Dwelling Info</h2>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
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

        <div>
          <label className={labelCls}>Conductor Material</label>
          <div className="flex gap-6 mt-1.5">
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
      </div>
    </section>
  );
}
