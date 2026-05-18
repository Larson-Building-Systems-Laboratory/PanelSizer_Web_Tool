export interface ApplianceInput {
  name: string;
  power_watts: number;
  voltage: 120 | 240;
}

export interface CalculatePayload {
  square_feet: number;
  kitchen_circuits: number;
  laundry_circuits: number;
  material: 'copper' | 'aluminum';
  appliances: ApplianceInput[];
}

export interface ConductorResult {
  service_rating?: number;
  conductor_size: string;
}

export interface CalculateResult {
  success: boolean;
  log: string[];
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

  let json: any;
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
