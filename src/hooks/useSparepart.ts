import { useState } from "react";
import type { EPart } from "@/components/service/PartSearch";
import { SparepartDipakai } from "@/types/service";

// hooks/useSparepart.ts
export function useSparepart() {
  const [sparepart, setSparepart] = useState<SparepartDipakai[]>([]);

  const addPart = (part: EPart) => {
    setSparepart((prev) => {
      const exist = prev.find((p) => p.id === part.id);

      if (exist) {
        return prev.map((p) =>
          p.id === part.id ? { ...p, qty: p.qty + 1 } : p
        );
      }

      // ✅ SIMPAN SEMUA DATA PENTING DENGAN FIELD KONSISTEN
      return [
        ...prev,
        {
          id: part.id,
          nama: `${part.no_part} - ${part.nama}`,
          harga: part.harga,
          qty: 1,
          unit: part.base_unit as "PCS" | "LITER", // ✅ DARI DATABASE
          baseUnit: part.base_unit, // ✅ DARI DATABASE
          pcs_per_pack: part.pcs_per_pack ?? null, // ✅ KONSISTEN
          pack_label: part.pack_label ?? null, // ✅ KONSISTEN
          liter_per_pcs: part.liter_per_pcs ?? null, // ✅ DARI DATABASE
        },
      ];
    });
  };

  const updateQty = (id: string, qty: number) => {
    setSparepart((prev) =>
      prev.map((sp) => (sp.id === id ? { ...sp, qty: Math.max(1, qty) } : sp))
    );
  };

  const updateUnit = (
    id: string,
    newUnit: "PCS" | "PACK" | "LITER" | "BOTOL"
  ) => {
    setSparepart((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        // Harga base sudah tersimpan di item.harga
        // Tidak perlu kalkulasi ulang karena subtotal di-handle oleh calculateSubtotal

        return {
          ...item,
          unit: newUnit,
        };
      })
    );
  };

  const removeItem = (id: string) => {
    setSparepart((prev) => prev.filter((sp) => sp.id !== id));
  };

  const setFromEstimasi = (items: SparepartDipakai[]) => {
    setSparepart(
      (items || []).map((i) => ({
        ...i,
        unit: i.unit ?? i.baseUnit, // ✅ Fallback ke baseUnit
        pcs_per_pack: i.pcs_per_pack ?? null, // ✅ KONSISTEN
        pack_label: i.pack_label ?? null, // ✅ KONSISTEN
        liter_per_pcs: i.liter_per_pcs ?? null,
      }))
    );
  };

  return {
    sparepart,
    addPart,
    updateQty,
    updateUnit,
    removeItem,
    setFromEstimasi,
  };
}
