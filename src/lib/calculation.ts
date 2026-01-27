import { SparepartDipakai } from "@/types/service";

export function calculateTotal(
  sparepart: SparepartDipakai[],
  biayaServis: number,
  diskon: number
) {
  const totalSparepart = sparepart.reduce((sum, s) => sum + s.harga * s.qty, 0);

  const subtotal = biayaServis + totalSparepart;
  const totalBayar = subtotal - diskon;

  return {
    totalSparepart,
    subtotal,
    totalBayar,
  };
}
