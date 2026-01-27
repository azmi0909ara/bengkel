"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type EPart = {
  id: string;
  nama: string;
  no_part: string;
  harga: number;
};

export default function PartSearch({
  onAdd,
}: {
  onAdd: (part: EPart) => void;
}) {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<EPart[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (keyword.length < 2) {
      setResults([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);

      const key = keyword.trim().toUpperCase();

      const q = query(
        collection(db, "stok"),
        where("search_key", "array-contains", key),
        limit(10)
      );

      const snap = await getDocs(q);

      setResults(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            nama: data.nama_sparepart,
            no_part: data.no_sparepart,
            harga: data.harga_jual,
          };
        })
      );

      setLoading(false);
    };

    fetchData();
  }, [keyword]);

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <input
          className="input w-full bg-gray-800 border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          placeholder="Cari No Part / Nama Part..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        {keyword && (
          <button
            type="button"
            onClick={() => {
              setKeyword("");
              setResults([]);
            }}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-400 px-4 py-2">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Mencari sparepart...
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
          {results.map((p) => (
            <div
              key={p.id}
              onClick={() => {
                onAdd(p);
                setKeyword("");
                setResults([]);
              }}
              className="cursor-pointer bg-gray-800 border border-gray-700 p-4 rounded-lg hover:bg-gray-700"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <svg
                      className="w-4 h-4 text-red-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    <p className="font-bold text-white group-hover:text-red-400 transition-colors truncate">
                      {p.no_part}
                    </p>
                  </div>
                  <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                    {p.nama}
                  </p>
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-base font-semibold text-green-400">
                      Rp {p.harga.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center group-hover:bg-red-500 transition-colors">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && keyword.length >= 2 && results.length === 0 && (
        <div className="text-center py-8 px-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-600 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-gray-400 text-sm">Tidak ada sparepart ditemukan</p>
          <p className="text-gray-500 text-xs mt-1">Coba kata kunci lain</p>
        </div>
      )}
    </div>
  );
}
