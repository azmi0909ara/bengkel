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

      // ✅ SIMPAN SEMUA DATA PENTING
      return [
        ...prev,
        {
          id: part.id,
          nama: `${part.no_part} - ${part.nama}`,
          harga: part.harga,
          qty: 1,
          unit: part.base_unit, // ✅ DARI DATABASE
          baseUnit: part.base_unit, // ✅ DARI DATABASE
          pack_size: part.pcs_per_pack ?? null, // ✅ DARI DATABASE
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

  const updateUnit = (id: string, newUnit: "PCS" | "PACK" | "LITER") => {
    setSparepart((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        let hargaDisplay = item.harga; // harga base (per PCS atau per LITER)

        // 🎯 KALKULASI HARGA BERDASARKAN UNIT
        if (newUnit === "PACK" && item.pack_size) {
          // Harga PACK = harga PCS × jumlah isi pack
          hargaDisplay = item.harga * item.pack_size;
        } else if (
          newUnit === "PCS" &&
          item.baseUnit === "LITER" &&
          item.liter_per_pcs
        ) {
          // Harga BOTOL = harga LITER × isi per botol
          hargaDisplay = item.harga * item.liter_per_pcs;
        } else {
          // Default: gunakan harga base
          hargaDisplay = item.harga;
        }

        return {
          ...item,
          unit: newUnit,
          harga_display: hargaDisplay,
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
        pack_size: i.pack_size ?? null,
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
