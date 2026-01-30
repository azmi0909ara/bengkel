export type UnitType = "PCS" | "PACK" | "LITER";

export type Unit = "PCS" | "PACK" | "LITER";

export type Pelanggan = {
  id: string;
  nama: string;
};

export type Kendaraan = {
  id: string;
  pelangganId: string;
  nomorPolisi: string;
  merek: string;
};

// types/service.ts
export type SparepartDipakai = {
  id: string;
  nama: string;
  harga: number;
  qty: number;
  unit: "PCS" | "PACK" | "LITER";

  // ✅ METADATA DARI DATABASE
  baseUnit: "PCS" | "LITER";
  pack_size?: number | null; // ← WAJIB
  liter_per_pcs?: number | null; // ← WAJIB
};

export type Estimasi = {
  id: string;
  tanggal: any;
  pelangganId: string;
  pelangganNama: string;
  kendaraanId: string;
  kendaraanLabel: string;
  keluhan: string;
  jenisPembayaran: string;
  sparepart: SparepartDipakai[];
  biayaServis: number;
  totalSparepart: number;
  diskon: number;
  totalBayar: number;
  status: string;
};
