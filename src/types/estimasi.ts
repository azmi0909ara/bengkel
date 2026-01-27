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
