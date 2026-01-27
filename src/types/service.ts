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

export type SparepartDipakai = {
  id: string;
  nama: string;
  harga: number;
  qty: number;
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
