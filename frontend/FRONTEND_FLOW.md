# Frontend Data Flow

## Overview

All form state lives in `page.tsx`. Child components are stateless — they receive data via props and call callbacks to update the parent. On submit, `page.tsx` builds the API payload and calls `panelSizer.ts`, which POSTs to the Flask backend via the Next.js proxy.

---

## Files & Responsibilities

### `src/components/DwellingForm.tsx`
- **Stateless** — receives `values: DwellingValues` and `onChange` as props.
- Renders 4 controlled inputs: Floor Area, Kitchen Circuits, Laundry Circuits, Conductor Material.
- Every change calls `onChange(field, value)` → bubbles up to `page.tsx`.

```ts
// Internal type
interface DwellingValues {
  squareFeet: string;
  kitchenCircuits: number;
  laundryCircuits: number;
  material: 'copper' | 'aluminum';
}
```

---

### `src/components/ApplianceList.tsx`
- **Stateless** — receives `appliances[]`, `onAdd`, `onChange`, `onRemove` as props.
- Renders a list of `ApplianceRow` components.
- Each row has: name (with datalist suggestions), power (watts), voltage (120/240 V), remove button.
- Each `ApplianceRow` calls `onChange(id, field, value)` — the UUID `id` lets `page.tsx` find the right appliance.
- `newAppliance()` helper creates a blank appliance with a `uuidv4()` id.

```ts
interface Appliance {
  id: string;       // UUID, used as React key + update target
  name: string;
  powerWatts: string;
  voltage: 120 | 240;
}
```

---

### `src/app/page.tsx`
- **State container** — owns all form data.
- Passes handlers down to `DwellingForm` and `ApplianceList`.
- On form submit, maps internal camelCase fields → snake_case payload for the API.
- Manages `loading`, `error`, and `results` states to control UI rendering.

**State:**
```ts
const [dwelling, setDwelling]   = useState<DwellingValues>(DEFAULTS);
const [appliances, setAppliances] = useState<Appliance[]>([]);
const [loading, setLoading]     = useState(false);
const [error, setError]         = useState<string | null>(null);
const [results, setResults]     = useState<CalculateResult | null>(null);
```

**On submit (`calculate`):**
```ts
const data = await calculatePanel({
  square_feet:      Number(dwelling.squareFeet),     // camelCase → snake_case
  kitchen_circuits: Number(dwelling.kitchenCircuits),
  laundry_circuits: Number(dwelling.laundryCircuits),
  material:         dwelling.material,
  appliances: appliances.map(a => ({
    name:        a.name,
    power_watts: Number(a.powerWatts),
    voltage:     a.voltage,
  })),
});
setResults(data);
```

**Render logic:**
| State | What renders (right column) |
|---|---|
| No results, not loading | Placeholder prompt card |
| `loading === true` | Spinning loader card |
| `results !== null` | `ResultsPanel` + `CalculationLog` |
| `error !== null` | Red error banner (left column, above submit) |

---

### `src/api/panelSizer.ts`
- Single async function `calculatePanel(data: CalculatePayload)`.
- POSTs JSON to `/api/calculate` (relative URL — proxied by Next.js to `http://localhost:8000`).
- Throws an `Error` if `res.ok` is false or `json.success` is false, caught by `page.tsx`.
- Returns typed `CalculateResult` on success.

```ts
// Request shape
interface CalculatePayload {
  square_feet: number;
  kitchen_circuits: number;
  laundry_circuits: number;
  material: 'copper' | 'aluminum';
  appliances: { name: string; power_watts: number; voltage: 120 | 240 }[];
}

// Response shape
interface CalculateResult {
  success: boolean;
  log: string[];
  service:  { service_rating?: number; conductor_size: string };
  neutral:  { conductor_size: string };
  grounding_conductor_size: string;
}
```

---

## End-to-End Flow

```
User types/selects in DwellingForm or ApplianceList
        │
        │  onChange(field, value)
        ▼
page.tsx  →  setState (dwelling / appliances)
        │
        │  User clicks "Calculate Panel Size"
        │  form onSubmit → calculate()
        │
        │  builds snake_case CalculatePayload
        ▼
calculatePanel()  in  panelSizer.ts
        │
        │  fetch POST '/api/calculate'
        ▼
Next.js proxy  (next.config.ts)
        │
        │  rewrites → http://localhost:8000/api/calculate
        ▼
Flask backend  (backend/app.py)
        │
        │  runs Dwelling.py NEC calculations
        │  returns { success, log, service, neutral, grounding_conductor_size }
        ▼
back to page.tsx  →  setResults(data)
        │
        ▼
ResultsPanel  +  CalculationLog  render with results
```

---

## Key Design Notes

- **camelCase vs snake_case**: Components use camelCase (`squareFeet`, `powerWatts`). The API expects snake_case (`square_feet`, `power_watts`). The conversion happens once, inside `calculate()` in `page.tsx`.
- **Proxy**: The frontend never hardcodes port 8000. `/api/*` is rewritten by `next.config.ts`, so the backend URL is configured in one place only.
- **Appliance name matching**: Names like `"Clothes Dryer"` or `"Electric Range"` must match exactly what `Dwelling.py` expects — the datalist suggestions in `ApplianceList` reflect the valid names.
