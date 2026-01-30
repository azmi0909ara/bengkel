// lib/stokConverter.ts
export function convertToBaseUnit(params: {
  qty: number;
  unit: string;
  baseUnit: "PCS" | "LITER";
  literPerPcs: number | null;
  pcsPerPack: number | null;
}): number {
  const { qty, unit, baseUnit, literPerPcs, pcsPerPack } = params;

  // BASE UNIT = LITER
  if (baseUnit === "LITER") {
    if (unit === "LITER") return qty;
    if (unit === "PCS" && literPerPcs) return qty * literPerPcs; // BOTOL
    return qty; // fallback
  }

  // BASE UNIT = PCS
  if (baseUnit === "PCS") {
    if (unit === "PCS") return qty;
    if (unit === "PACK" && pcsPerPack) return qty * pcsPerPack;
    return qty; // fallback
  }

  return qty;
}
