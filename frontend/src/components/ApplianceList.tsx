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
  'bg-bg border border-border rounded-md text-text text-sm px-2.5 py-2 w-full outline-none focus:border-blue transition-colors';

interface RowProps {
  appliance: Appliance;
  onChange: (id: string, field: keyof Appliance, value: string | number) => void;
  onRemove: (id: string) => void;
}

function ApplianceRow({ appliance, onChange, onRemove }: RowProps) {
  return (
    <div className="grid grid-cols-[1fr_110px_90px_36px] gap-2 items-center py-1.5">
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
        className="w-[30px] h-[30px] flex items-center justify-center rounded-md border border-remove-border text-remove-fg text-sm cursor-pointer hover:bg-remove-border hover:text-red transition-colors"
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
    <section className="bg-bg-card border border-border rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">Appliances</h2>
        <button
          type="button"
          onClick={onAdd}
          className="border border-dashed border-border text-muted text-xs px-3 py-1.5 rounded-md hover:border-blue hover:text-blue transition-colors cursor-pointer"
        >
          + Add Appliance
        </button>
      </div>

      {appliances.length === 0 && (
        <p className="text-xs text-muted text-center py-4">
          No appliances added yet. Click &quot;+ Add Appliance&quot; to begin.
        </p>
      )}

      {appliances.length > 0 && (
        <div className="grid grid-cols-[1fr_110px_90px_36px] gap-2 pb-1.5 mb-1 border-b border-border text-[11px] uppercase tracking-wider text-muted">
          <span>Name</span><span>Power</span><span>Voltage</span><span />
        </div>
      )}

      {appliances.map(a => (
        <ApplianceRow key={a.id} appliance={a} onChange={onChange} onRemove={onRemove} />
      ))}
    </section>
  );
}
