import { useState } from "react";
import type { EPart } from "@/components/service/PartSearch";
import { SparepartDipakai } from "@/types/service";

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

      return [
        ...prev,
        {
          id: part.id,
          nama: `${part.no_part} - ${part.nama}`,
          harga: part.harga,
          qty: 1,
        },
      ];
    });
  };

  const updateQty = (id: string, qty: number) => {
    setSparepart((prev) =>
      prev.map((sp) => (sp.id === id ? { ...sp, qty: Math.max(1, qty) } : sp))
    );
  };

  const removeItem = (id: string) => {
    setSparepart((prev) => prev.filter((sp) => sp.id !== id));
  };

  const setFromEstimasi = (items: SparepartDipakai[]) => {
    setSparepart(items || []);
  };

  return {
    sparepart,
    addPart,
    updateQty,
    removeItem,
    setFromEstimasi,
  };
}
