import { useState } from "react";
import type { EPart } from "@/components/service/PartSearch";
import { SparepartDipakai } from "@/types/service";

export function useSparepart() {
  const [sparepart, setSparepart] = useState<SparepartDipakai[]>([]);

  // tambah part (default PCS)
  const addPart = (part: EPart) => {
    setSparepart((prev) => {
      const exist = prev.find((p) => p.id === part.id);

      if (exist) {
        return prev.map((p) =>
          p.id === part.id ? { ...p, qty: p.qty + 1 } : p
        );
      }

      return [
        ...prev,
        {
          id: part.id,
          nama: `${part.no_part} - ${part.nama}`,
          harga: part.harga,
          qty: 1,
          unit: "PCS", // 🔥 DEFAULT AMAN
        },
      ];
    });
  };

  // update qty
  const updateQty = (id: string, qty: number) => {
    setSparepart((prev) =>
      prev.map((sp) => (sp.id === id ? { ...sp, qty: Math.max(1, qty) } : sp))
    );
  };

  // update unit (PCS / PACK)
  const updateUnit = (id: string, unit: "PCS" | "PACK") => {
    setSparepart((prev) =>
      prev.map((sp) => (sp.id === id ? { ...sp, unit } : sp))
    );
  };

  const removeItem = (id: string) => {
    setSparepart((prev) => prev.filter((sp) => sp.id !== id));
  };

  // dari estimasi (PASTIKAN ADA unit)
  const setFromEstimasi = (items: SparepartDipakai[]) => {
    setSparepart(
      (items || []).map((i) => ({
        ...i,
        unit: i.unit ?? "PCS",
      }))
    );
  };

  return {
    sparepart,
    addPart,
    updateQty,
    updateUnit, // 🔥 JANGAN LUPA EXPORT
    removeItem,
    setFromEstimasi,
  };
}
