export type UnitType = "PCS" | "PACK" | "LITER" | "BOTOL";

export type Unit = "PCS" | "PACK" | "LITER" | "BOTOL";

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
  unit: "PCS" | "PACK" | "LITER" | "BOTOL";

  // ✅ METADATA DARI DATABASE (KONSISTEN DENGAN STOK)
  baseUnit: "PCS" | "LITER";
  pcs_per_pack?: number | null; // ← untuk PACK
  pack_label?: string | null; // ← label PACK (BOX/KARTON/DUS)
  liter_per_pcs?: number | null; // ← untuk BOTOL
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
