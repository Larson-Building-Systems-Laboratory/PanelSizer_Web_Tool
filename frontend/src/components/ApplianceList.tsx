import { v4 as uuidv4 } from 'uuid';

export interface Appliance {
  id: string;
  name: string;
  powerWatts: string;
  voltage: 120 | 240;
}

export function newAppliance(): Appliance {
  return { id: uuidv4(), name: '', powerWatts: '', voltage: 240 };
}

const SUGGESTIONS = [
  'Disposal', 'Compactor', 'Blower Motor', 'Dishwasher', 'Water Heater',
  'Clothes Dryer', 'Electric Range', 'Space Heater', 'Air Conditioner', 'Heat Pump',
];

const inputCls =
  'bg-white border border-border rounded text-text text-sm px-2.5 py-2 w-full outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-colors';

interface RowProps {
  appliance: Appliance;
  onChange: (id: string, field: keyof Appliance, value: string | number) => void;
  onRemove: (id: string) => void;
}

function ApplianceRow({ appliance, onChange, onRemove }: RowProps) {
  return (
    <div className="grid grid-cols-[1fr_110px_90px_36px] gap-2 items-center py-2 border-b border-border last:border-b-0">
      <input
        className={inputCls}
        type="text"
        list="appliance-suggestions"
        placeholder="Appliance name"
        value={appliance.name}
        onChange={e => onChange(appliance.id, 'name', e.target.value)}
      />
      <datalist id="appliance-suggestions">
        {SUGGESTIONS.map(s => <option key={s} value={s} />)}
      </datalist>

      <div className="relative">
        <input
          type="number"
          min="1"
          placeholder="Watts"
          className={`${inputCls} pr-7`}
          value={appliance.powerWatts}
          onChange={e => onChange(appliance.id, 'powerWatts', e.target.value)}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted pointer-events-none">W</span>
      </div>

      <select
        className={inputCls}
        value={appliance.voltage}
        onChange={e => onChange(appliance.id, 'voltage', Number(e.target.value) as 120 | 240)}
      >
        <option value={120}>120 V</option>
        <option value={240}>240 V</option>
      </select>

      <button
        type="button"
        aria-label="Remove appliance"
        onClick={() => onRemove(appliance.id)}
        className="w-[30px] h-[30px] flex items-center justify-center rounded border border-remove-border text-remove-fg text-sm cursor-pointer hover:bg-error-bg hover:text-red transition-colors"
      >
        ✕
      </button>
    </div>
  );
}

interface Props {
  appliances: Appliance[];
  onAdd: () => void;
  onChange: (id: string, field: keyof Appliance, value: string | number) => void;
  onRemove: (id: string) => void;
}

export default function ApplianceList({ appliances, onAdd, onChange, onRemove }: Props) {
  return (
    <section className="bg-bg-card border border-border rounded-lg shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-bg-card-hover">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-blue text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
          <h2 className="text-sm font-semibold text-text">Appliances</h2>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="bg-white border border-border text-muted text-xs px-3 py-1.5 rounded hover:border-blue hover:text-blue transition-colors cursor-pointer"
        >
          + Add Appliance
        </button>
      </div>

      <div className="p-5">
        {appliances.length === 0 && (
          <p className="text-xs text-muted text-center py-4">
            No appliances added yet. Click &quot;+ Add Appliance&quot; to begin.
          </p>
        )}

        {appliances.length > 0 && (
          <>
            <div className="grid grid-cols-[1fr_110px_90px_36px] gap-2 pb-2 mb-1 border-b border-border text-[11px] font-semibold uppercase tracking-wider text-muted">
              <span>Name</span><span>Power</span><span>Voltage</span><span />
            </div>
            {appliances.map(a => (
              <ApplianceRow key={a.id} appliance={a} onChange={onChange} onRemove={onRemove} />
            ))}
          </>
        )}
      </div>
    </section>
  );
}
