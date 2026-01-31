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
  pack_label?: string | null; // ✅ TAMBAHAN: konsisten dengan SparepartDipakai
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

      // ✅ MAPPING LENGKAP & KONSISTEN
      const data: EPart[] = snap.docs.map((d) => {
        const item = d.data();
        return {
          id: d.id,
          no_part: item.no_sparepart || "",
          nama: item.nama_sparepart || "",
          harga: item.harga_jual || 0,
          base_unit: item.base_unit || "PCS",
          pcs_per_pack: item.pcs_per_pack ?? null,
          pack_label: item.pack_label ?? null, // ✅ TAMBAHAN
          liter_per_pcs: item.liter_per_pcs ?? null,
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
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors"
        >
          {loading ? "Cari..." : "🔍 Cari"}
        </button>
      </div>

      {results.length > 0 && (
        <div className="border border-gray-700 rounded-lg max-h-64 overflow-y-auto bg-gray-800/50">
          {results.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 hover:bg-gray-800 border-b border-gray-700 last:border-0 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white truncate">
                  {item.nama}
                </div>
                <div className="text-sm text-gray-400 flex flex-wrap gap-2 mt-1">
                  <span className="font-mono">{item.no_part}</span>
                  <span>•</span>
                  <span className="text-green-400 font-semibold">
                    Rp {item.harga.toLocaleString("id-ID")}
                  </span>

                  {/* Info Satuan & Pack */}
                  {item.base_unit === "LITER" && (
                    <>
                      <span>•</span>
                      <span className="px-2 py-0.5 bg-blue-900/50 text-blue-300 rounded text-xs">
                        LITER
                      </span>
                    </>
                  )}

                  {item.pcs_per_pack && item.pcs_per_pack > 1 && (
                    <>
                      <span>•</span>
                      <span className="px-2 py-0.5 bg-purple-900/50 text-purple-300 rounded text-xs">
                        {item.pack_label || "PACK"} ({item.pcs_per_pack} pcs)
                      </span>
                    </>
                  )}

                  {item.liter_per_pcs && (
                    <>
                      <span>•</span>
                      <span className="px-2 py-0.5 bg-cyan-900/50 text-cyan-300 rounded text-xs">
                        {item.liter_per_pcs}L/botol
                      </span>
                    </>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onAdd(item);
                  setResults([]);
                  setSearch("");
                }}
                className="ml-4 flex-shrink-0 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-md hover:shadow-lg"
              >
                + Tambah
              </button>
            </div>
          ))}
        </div>
      )}

      {search && results.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-400 border border-gray-700 rounded-lg bg-gray-800/30">
          <svg
            className="w-12 h-12 mx-auto mb-3 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="font-medium">Tidak ada hasil</p>
          <p className="text-sm mt-1">
            Coba kata kunci lain atau periksa ejaan
          </p>
        </div>
      )}
    </div>
  );
}
