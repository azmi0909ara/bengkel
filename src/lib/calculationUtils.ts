// lib/calculationUtils.ts
/**
 * Utilities untuk perhitungan stok, harga, dan total
 * Semua logic terkait unit conversion dan pricing ada di sini
 */

import { SparepartDipakai } from "@/types/service";

/* ===============================================
   1️⃣ KONVERSI UNIT KE BASE UNIT (untuk stok)
=============================================== */

export function convertToBaseUnit(params: {
  qty: number;
  unit: "PCS" | "PACK" | "LITER" | "BOTOL";
  baseUnit: "PCS" | "LITER";
  literPerPcs?: number | null;
  pcsPerPack?: number | null;
}): number {
  const { qty, unit, baseUnit, literPerPcs, pcsPerPack } = params;

  // BASE UNIT = LITER
  if (baseUnit === "LITER") {
    if (unit === "LITER") return qty;
    // Tidak ada case lain untuk LITER base, karena LITER curah tidak bisa PACK/BOTOL
    return qty; // fallback
  }

  // BASE UNIT = PCS
  if (baseUnit === "PCS") {
    if (unit === "PCS") return qty;
    if (unit === "PACK" && pcsPerPack) return qty * pcsPerPack;
    if (unit === "BOTOL" && literPerPcs) return qty; // BOTOL tetap dihitung PCS (unit fisik)
    return qty; // fallback
  }

  return qty;
}

/* ===============================================
   2️⃣ PERHITUNGAN HARGA (untuk penjualan)
=============================================== */

/**
 * Menghitung harga per unit yang dipilih user
 * Base harga adalah harga_jual dari database (per base unit)
 */
export function getPricePerUnit(item: {
  harga: number; // harga per base unit (dari database)
  baseUnit: "PCS" | "LITER";
  unit: "PCS" | "PACK" | "LITER" | "BOTOL";
  pcsPerPack?: number | null;
  liter_per_pcs?: number | null;
}): number {
  const { harga, baseUnit, unit, pcsPerPack, liter_per_pcs } = item;

  // BASE UNIT = PCS
  if (baseUnit === "PCS") {
    if (unit === "PCS") return harga; // harga per pcs
    if (unit === "PACK" && pcsPerPack) return harga * pcsPerPack; // harga per pack
    if (unit === "BOTOL" && liter_per_pcs) return harga * liter_per_pcs; // oli botol (harga base per liter)
    return harga;
  }

  // BASE UNIT = LITER
  if (baseUnit === "LITER") {
    return harga; // selalu per liter
  }

  return harga;
}

/**
 * Menghitung subtotal untuk satu item sparepart
 */
export function calculateSubtotal(item: {
  harga: number;
  baseUnit: "PCS" | "LITER";
  unit: "PCS" | "PACK" | "LITER" | "BOTOL";
  qty: number;
  pcs_per_pack?: number | null;
  liter_per_pcs?: number | null;
}): number {
  const pricePerUnit = getPricePerUnit({
    harga: item.harga,
    baseUnit: item.baseUnit,
    unit: item.unit,
    pcsPerPack: item.pcs_per_pack,
    liter_per_pcs: item.liter_per_pcs,
  });

  return pricePerUnit * item.qty;
}

/* ===============================================
   3️⃣ PERHITUNGAN TOTAL (untuk invoice)
=============================================== */

export function calculateTotal(
  sparepart: SparepartDipakai[],
  biayaServis: number,
  diskon: number
) {
  // Total sparepart dengan memperhitungkan unit yang dipilih
  const totalSparepart = sparepart.reduce((sum, item) => {
    return sum + calculateSubtotal(item);
  }, 0);

  const subtotal = biayaServis + totalSparepart;
  const totalBayar = Math.max(0, subtotal - diskon); // tidak boleh minus

  return {
    totalSparepart,
    subtotal,
    totalBayar,
  };
}

/* ===============================================
   4️⃣ VALIDASI (optional helpers)
=============================================== */

/**
 * Validasi apakah unit yang dipilih valid untuk base unit tersebut
 */
export function isValidUnitForBaseUnit(
  unit: "PCS" | "PACK" | "LITER" | "BOTOL",
  baseUnit: "PCS" | "LITER"
): boolean {
  if (baseUnit === "LITER") {
    return unit === "LITER"; // LITER curah hanya boleh LITER
  }

  if (baseUnit === "PCS") {
    return ["PCS", "PACK", "BOTOL"].includes(unit);
  }

  return false;
}

/**
 * Get available units for a sparepart
 */
export function getAvailableUnits(item: {
  baseUnit: "PCS" | "LITER";
  pcs_per_pack?: number | null;
  liter_per_pcs?: number | null;
}): Array<"PCS" | "PACK" | "LITER" | "BOTOL"> {
  const units: Array<"PCS" | "PACK" | "LITER" | "BOTOL"> = [];

  if (item.baseUnit === "LITER") {
    units.push("LITER");
  } else {
    // BASE UNIT = PCS
    units.push("PCS");

    if (item.pcs_per_pack && item.pcs_per_pack > 1) {
      units.push("PACK");
    }

    if (item.liter_per_pcs && item.liter_per_pcs > 0) {
      units.push("BOTOL");
    }
  }

  return units;
}
