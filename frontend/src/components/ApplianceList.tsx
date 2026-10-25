export interface Appliance {
  id: string;
  name: string;
  powerWatts: string;
  voltage: 120 | 208 | 240;
}

// Row ids only need to be unique within the page session (they are React keys)
let nextId = 0;

export function newAppliance(phase: 1 | 3 = 1): Appliance {
  nextId += 1;
  return { id: `appliance-${nextId}`, name: '', powerWatts: '', voltage: phase === 3 ? 208 : 240 };
}

const SUGGESTIONS = [
  'Disposal', 'Compactor', 'Blower Motor', 'Dishwasher', 'Water Heater',
  'Clothes Dryer', 'Electric Range', 'Heat Pump', 'Air Conditioner',
  'Electric Heating System',
];

const inputCls = 'field w-full px-2.5 py-2 text-[15px] text-body max-sm:text-base';

interface RowProps {
  appliance: Appliance;
  phase: 1 | 3;
  onChange: (id: string, field: keyof Appliance, value: string | number) => void;
  onRemove: (id: string) => void;
}

function ApplianceRow({ appliance, phase, onChange, onRemove }: RowProps) {
  const secondaryVoltage = phase === 3 ? 208 : 240;

  return (
    <div className="animate-settle grid grid-cols-[1fr_96px_80px_32px] gap-2 items-center py-2 border-b border-hairline last:border-b-0 max-sm:grid-cols-[1fr_1fr_40px] max-sm:py-3 max-sm:first:pt-0 max-sm:last:pb-0">
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
          className={`${inputCls} nums pr-7`}
          value={appliance.powerWatts}
          onChange={e => onChange(appliance.id, 'powerWatts', e.target.value)}
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[12px] text-muted pointer-events-none">W</span>
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
        className="w-8 h-8 max-sm:w-10 max-sm:h-10 flex items-center justify-center rounded-full bg-mist text-muted text-[13px] cursor-pointer hover:bg-mist hover:text-error active:scale-95 transition"
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
    <section className="card">
      <div className="flex items-center justify-between gap-3 px-6 pt-6 max-sm:px-4 max-sm:pt-5">
        <div className="flex items-center gap-3">
          <span className="nums w-7 h-7 rounded-full bg-mint text-primary text-[13px] font-semibold flex items-center justify-center shrink-0">2</span>
          <h2 className="text-[21px] tracking-[-0.2px]">Appliances</h2>
        </div>
        <button type="button" onClick={onAdd} className="btn btn-secondary btn-sm">
          + Add Appliance
        </button>
      </div>

      <div className="p-6 pt-4 max-sm:p-4">
        {appliances.length === 0 && (
          <p className="text-[14px] text-muted text-center py-6 rounded-chip bg-mist">
            No appliances added yet. Click &quot;+ Add Appliance&quot; to begin.
          </p>
        )}

        {appliances.length > 0 && (
          <>
            <div className="grid grid-cols-[1fr_96px_80px_32px] gap-2 pb-2 mb-1 max-sm:hidden border-b border-hairline text-[13px] font-semibold text-muted">
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
