"use client";

import { useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type EPart = {
  id: string;
  no_part: string;
  nama: string;
  harga: number;
  base_unit: "PCS" | "LITER";
  pcs_per_pack?: number | null;
  liter_per_pcs?: number | null;
};

export default function PartSearch({
  onAdd,
}: {
  onAdd: (part: EPart) => void;
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<EPart[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!search.trim()) return;

    setLoading(true);
    try {
      const q = query(
        collection(db, "stok"),
        where("search_key", "array-contains", search.toUpperCase().trim())
      );

      const snap = await getDocs(q);

      // ✅ MAPPING LENGKAP
      const data: EPart[] = snap.docs.map((d) => {
        const item = d.data();
        return {
          id: d.id,
          no_part: item.no_sparepart || "",
          nama: item.nama_sparepart || "",
          harga: item.harga_jual || 0,
          base_unit: item.base_unit || "PCS", // ✅ Wajib
          pcs_per_pack: item.pcs_per_pack ?? null, // ✅ Wajib
          liter_per_pcs: item.liter_per_pcs ?? null, // ✅ Wajib
        };
      });

      setResults(data);
    } catch (err) {
      console.error(err);
      alert("Gagal mencari data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder="Cari no part / nama..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? "Cari..." : "Cari"}
        </button>
      </div>

      {results.length > 0 && (
        <div className="border border-gray-700 rounded-lg max-h-64 overflow-y-auto">
          {results.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 hover:bg-gray-800 border-b border-gray-700 last:border-0"
            >
              <div>
                <div className="font-medium text-white">{item.nama}</div>
                <div className="text-sm text-gray-400">
                  {item.no_part} • Rp {item.harga.toLocaleString("id-ID")}
                  {item.base_unit?.toUpperCase() === "LITER" && " • LITER"}
                  {item.pcs_per_pack && ` • Pack ${item.pcs_per_pack} pcs`}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onAdd(item);
                  setResults([]);
                  setSearch("");
                }}
                className="bg-green-600 hover:bg-green-700 px-4 py-1.5 rounded text-sm font-medium"
              >
                + Tambah
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
