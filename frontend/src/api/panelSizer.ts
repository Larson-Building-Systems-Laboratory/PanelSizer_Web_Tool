export interface ApplianceInput {
  name: string;
  power_watts: number;
  voltage: 120 | 208 | 240;
}

export type CalculationMethod = 'Standard' | 'Optional';
export type Phase = 1 | 3;

export interface CalculatePayload {
  square_feet: number;
  kitchen_circuits: number;
  laundry_circuits: number;
  material: 'copper' | 'aluminum';
  method: CalculationMethod;
  phase: Phase;
  appliances: ApplianceInput[];
}

export interface ConductorResult {
  service_rating?: number | null;
  conductor_size: string;
}

export interface CalculateResult {
  success: boolean;
  log: string[];
  method: CalculationMethod;
  material: 'copper' | 'aluminum';
  phase: Phase;
  service: ConductorResult;
  neutral: ConductorResult;
  grounding_conductor_size: string;
}

export async function calculatePanel(data: CalculatePayload): Promise<CalculateResult> {
  const res = await fetch('/api/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  let json: { success?: boolean; error?: string };
  try {
    json = await res.json();
  } catch {
    throw new Error(`Server error (${res.status}): backend may not be running.`);
  }

  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Calculation failed.');
  }

  return json as CalculateResult;
}
