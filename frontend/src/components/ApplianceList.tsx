import { v4 as uuidv4 } from 'uuid';

export interface Appliance {
  id: string;
  name: string;
  powerWatts: string;
  voltage: 120 | 208 | 240;
}

export function newAppliance(phase: 1 | 3 = 1): Appliance {
  return { id: uuidv4(), name: '', powerWatts: '', voltage: phase === 3 ? 208 : 240 };
}

const SUGGESTIONS = [
  'Disposal', 'Compactor', 'Blower Motor', 'Dishwasher', 'Water Heater',
  'Clothes Dryer', 'Electric Range', 'Heat Pump', 'Air Conditioner',
  'Electric Heating System',
];

const inputCls =
  'bg-white border border-border rounded text-text text-sm max-sm:text-base px-2.5 py-2 w-full outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-colors';

interface RowProps {
  appliance: Appliance;
  phase: 1 | 3;
  onChange: (id: string, field: keyof Appliance, value: string | number) => void;
  onRemove: (id: string) => void;
}

function ApplianceRow({ appliance, phase, onChange, onRemove }: RowProps) {
  const secondaryVoltage = phase === 3 ? 208 : 240;

  return (
    <div className="grid grid-cols-[1fr_96px_80px_32px] gap-2 items-center py-2 border-b border-border last:border-b-0 max-sm:grid-cols-[1fr_1fr_40px] max-sm:py-3 max-sm:first:pt-0 max-sm:last:pb-0">
      <input
        className={`${inputCls} max-sm:col-span-3`}
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
        onChange={e => onChange(appliance.id, 'voltage', Number(e.target.value) as 120 | 208 | 240)}
      >
        <option value={120}>120 V</option>
        <option value={secondaryVoltage}>{secondaryVoltage} V</option>
      </select>

      <button
        type="button"
        aria-label="Remove appliance"
        onClick={() => onRemove(appliance.id)}
        className="w-[30px] h-[30px] max-sm:w-10 max-sm:h-10 flex items-center justify-center rounded border border-remove-border text-remove-fg text-sm cursor-pointer hover:bg-error-bg hover:text-red transition-colors"
      >
        ✕
      </button>
    </div>
  );
}

interface Props {
  appliances: Appliance[];
  phase: 1 | 3;
  onAdd: () => void;
  onChange: (id: string, field: keyof Appliance, value: string | number) => void;
  onRemove: (id: string) => void;
}

export default function ApplianceList({ appliances, phase, onAdd, onChange, onRemove }: Props) {
  return (
    <section className="bg-bg-card border border-border rounded-lg shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 max-sm:px-4 border-b border-border bg-bg-card-hover">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-blue text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
          <h2 className="text-sm font-semibold text-text">Appliances</h2>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="bg-white border border-border text-muted text-xs px-3 py-1.5 max-sm:text-sm max-sm:py-2 rounded hover:border-blue hover:text-blue transition-colors cursor-pointer"
        >
          + Add Appliance
        </button>
      </div>

      <div className="p-5 max-sm:p-4">
        {appliances.length === 0 && (
          <p className="text-xs text-muted text-center py-4">
            No appliances added yet. Click &quot;+ Add Appliance&quot; to begin.
          </p>
        )}

        {appliances.length > 0 && (
          <>
            <div className="grid grid-cols-[1fr_96px_80px_32px] gap-2 pb-2 mb-1 max-sm:hidden border-b border-border text-[11px] font-semibold uppercase tracking-wider text-muted">
              <span>Name</span><span>Power</span><span>Voltage</span><span />
            </div>
            {appliances.map(a => (
              <ApplianceRow key={a.id} appliance={a} phase={phase} onChange={onChange} onRemove={onRemove} />
            ))}
          </>
        )}
      </div>
    </section>
  );
}
