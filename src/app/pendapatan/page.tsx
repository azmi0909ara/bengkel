"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { convertToBaseUnit } from "@/lib/calculationUtils";

/* ================= TYPE ================= */

type HistorySparepart = {
  id: string;
  nama: string;
  qty: number;
  harga: number;

  // ✅ KONSISTEN DENGAN SISTEM BARU
  unit: "PCS" | "PACK" | "LITER" | "BOTOL";
  baseUnit: "PCS" | "LITER";
  pcs_per_pack?: number | null;
  pack_label?: string | null;
  liter_per_pcs?: number | null;
};

type History = {
  createdAt: Timestamp;
  sparepart: HistorySparepart[];
};

type Row = {
  id: string;
  nama: string;
  sumber: string;
  baseUnit: "PCS" | "LITER"; // ✅ TAMBAHAN
  terpakai: number; // dalam base unit
  totalTerjual: number;
};

/* ================= PAGE ================= */

export default function PendapatanPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // filter
  const [searchSumber, setSearchSumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      /* ===== FETCH STOK ===== */
      const stokSnap = await getDocs(collection(db, "stok"));
      const stokMap = new Map<string, any>();
      stokSnap.docs.forEach((d) => stokMap.set(d.id, d.data()));

      /* ===== FETCH HISTORY ===== */
      const historySnap = await getDocs(collection(db, "service"));
      const resultMap = new Map<string, Row>();

      historySnap.docs.forEach((doc) => {
        const h = doc.data() as any; // service doc

        // ===== FILTER TANGGAL =====
        const tgl = h.createdAt?.toDate();
        if (startDate && tgl < new Date(startDate)) return;
        if (endDate && tgl > new Date(endDate + "T23:59:59")) return;

        (h.sparepart || []).forEach((sp: HistorySparepart) => {
          const stok = stokMap.get(sp.id);

          if (!resultMap.has(sp.id)) {
            resultMap.set(sp.id, {
              id: sp.id,
              nama: stok?.nama_sparepart || sp.nama,
              sumber: stok?.sumber || "-",
              baseUnit: stok?.base_unit || sp.baseUnit || "PCS", // ✅ DARI DATABASE
              terpakai: 0,
              totalTerjual: 0,
            });
          }

          const row = resultMap.get(sp.id)!;

          // ✅ KONVERSI KE BASE UNIT
          const qtyInBaseUnit = convertToBaseUnit({
            qty: sp.qty || 0,
            unit: sp.unit || "PCS",
            baseUnit: row.baseUnit,
            pcsPerPack: sp.pcs_per_pack ?? null,
            literPerPcs: sp.liter_per_pcs ?? null,
          });

          row.terpakai += qtyInBaseUnit;
          row.totalTerjual += Number(sp.harga || 0) * (sp.qty || 0);
        });
      });

      setRows(Array.from(resultMap.values()));
      setLoading(false);
    };

    load();
  }, [startDate, endDate]);

  /* ================= SEARCH SUMBER ================= */

  const filteredRows = useMemo(() => {
    return rows.filter((r) =>
      r.sumber.toLowerCase().includes(searchSumber.toLowerCase())
    );
  }, [rows, searchSumber]);

  const totalPendapatan = filteredRows.reduce(
    (sum, r) => sum + r.totalTerjual,
    0
  );

  // ✅ HELPER UNTUK DISPLAY SATUAN
  const formatSatuan = (row: Row) => {
    if (row.baseUnit === "LITER") {
      return `${row.terpakai.toFixed(1)} LITER`;
    }

    // PCS - cek apakah ada pack info dari stok
    const sisaPcs = row.terpakai;
    return `${sisaPcs} PCS`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading pendapatan stok...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Kembali
          </button>
          <h1 className="text-3xl font-bold">📊 Pendapatan Sparepart</h1>
        </div>
      </div>

      {/* ================= FILTER ================= */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filter Data
        </h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-2">
              Cari Sumber
            </label>
            <input
              placeholder="Cari sumber stok..."
              value={searchSumber}
              onChange={(e) => setSearchSumber(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Clear Filter */}
        {(startDate || endDate || searchSumber) && (
          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
              setSearchSumber("");
            }}
            className="mt-4 text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
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
            Hapus Filter
          </button>
        )}
      </div>

      {/* ================= TOTAL ================= */}
      <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-700 px-8 py-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-green-600 p-3 rounded-lg">
            <svg
              className="w-8 h-8 text-white"
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
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Pendapatan</p>
            <p className="text-3xl font-bold text-green-400">
              Rp {totalPendapatan.toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Dari {filteredRows.length} item sparepart
            </p>
          </div>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Nama Sparepart
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Sumber
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Terpakai
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Total Pendapatan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <svg
                        className="w-16 h-16 opacity-50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-lg font-medium text-gray-300">
                        Tidak ada data pendapatan
                      </p>
                      <p className="text-sm text-gray-500">
                        {startDate || endDate
                          ? "Tidak ada transaksi pada rentang tanggal yang dipilih"
                          : "Belum ada transaksi service yang tercatat"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRows.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-white">
                      {r.nama}
                    </td>
                    <td className="px-6 py-4 text-gray-300">{r.sumber}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-900/50 text-blue-300">
                        {formatSatuan(r)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-lg font-bold text-green-400">
                        Rp {r.totalTerjual.toLocaleString("id-ID")}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredRows.length > 0 && (
              <tfoot className="bg-gray-800 border-t-2 border-gray-700">
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-4 text-right font-bold text-white"
                  >
                    TOTAL PENDAPATAN:
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xl font-bold text-green-400">
                      Rp {totalPendapatan.toLocaleString("id-ID")}
                    </span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Informasi
        </h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              Data pendapatan dihitung dari transaksi service yang telah
              diselesaikan
            </span>
          </li>
          <li className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              Qty terpakai ditampilkan dalam satuan dasar (PCS atau LITER)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              Gunakan filter tanggal dan sumber untuk analisis lebih detail
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
