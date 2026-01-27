"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useExportExcel } from "@/hooks/useExportExcel";
import { DateFilter, useDateFilter } from "@/hooks/useDataFilter";

/* ================= TYPE ================= */
type History = {
  id: string;
  tanggal: any;
  pelangganId: string;
  pelangganNama: string;
  kendaraanId: string;
  kendaraanLabel: string;
  mekanikNama: string;
  kmSekarang: number;
  keluhan: string;
  statusKendaraan: string;
  jenisPembayaran: string;
  jenisServis: string[];
  sparepart: {
    id: string;
    nama: string;
    harga: number;
    qty: number;
  }[];
  biayaServis: number;
  totalSparepart: number;
  totalBayar: number;
  status: string;
  createdAt: any;
  clearedAt: any;
};

/* ================= PAGE ================= */
export default function HistoryPage() {
  const [history, setHistory] = useState<History[]>([]);
  const [detail, setDetail] = useState<History | null>(null);
  const [filterDate, setFilterDate] = useState<DateFilter>("all");

  const { exportToExcel } = useExportExcel();
  const filteredHistory = useDateFilter(history, "createdAt", filterDate);

  /* ================= FETCH ================= */
  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(collection(db, "history"));
      setHistory(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    };
    load();
  }, []);

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-950 p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">History Service</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => exportToExcel(history, "data_penjualan.xlsx")}
            className="px-4 py-2 rounded-md bg-green-400"
          >
            Export Excel
          </button>
          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value as DateFilter)}
            className="bg-gray-800 border border-gray-700 px-4 py-2 rounded"
          >
            <option value="all">Semua Tanggal</option>
            <option value="daily">Hari Ini</option>
            <option value="weekly">Minggu Ini</option>
            <option value="monthly">Bulan Ini</option>
            <option value="yearly">Tahun Ini</option>
          </select>
        </div>
      </div>

      <table className="w-full text-sm border border-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-2 text-left">Tanggal</th>
            <th className="p-2 text-left">Pelanggan</th>
            <th className="p-2 text-left">Kendaraan</th>
            <th className="p-2 text-left">Total</th>
            <th className="p-2 ">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {filteredHistory.length > 0 ? (
            filteredHistory.map((h) => (
              <tr key={h.id} className="border-t border-gray-700">
                <td className="p-2">
                  {h.tanggal?.toDate().toLocaleDateString("id-ID")}
                </td>
                <td className="p-2">{h.pelangganNama}</td>
                <td className="p-2">{h.kendaraanLabel}</td>
                <td className="p-2">
                  Rp {h.totalBayar.toLocaleString("id-ID")}
                </td>
                <td className="p-2">
                  <button
                    onClick={() => setDetail(h)}
                    className="px-3 py-1 bg-gray-700 rounded text-center w-full"
                  >
                    Detail
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="p-12 text-center">
                <div className="flex flex-col items-center gap-3 text-gray-400">
                  <svg
                    className="w-16 h-16"
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
                    Belum Ada History
                  </p>
                  <p className="text-sm text-gray-500">
                    history transaksi akan muncul di sini
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ================= MODAL DETAIL ================= */}
      {detail && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className="bg-gray-900 w-full max-w-4xl max-h-[90vh] rounded-xl p-6 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Detail History Service</h2>

            {/* === INFO UTAMA === */}
            <table className="w-full text-sm border border-gray-700 mb-4">
              <tbody>
                <tr>
                  <td className="p-2 bg-gray-800 w-1/4">Pelanggan</td>
                  <td className="p-2">{detail.pelangganNama}</td>
                </tr>
                <tr>
                  <td className="p-2 bg-gray-800">Kendaraan</td>
                  <td className="p-2">{detail.kendaraanLabel}</td>
                </tr>
                <tr>
                  <td className="p-2 bg-gray-800">Mekanik</td>
                  <td className="p-2">{detail.mekanikNama}</td>
                </tr>
                <tr>
                  <td className="p-2 bg-gray-800">KM Sekarang</td>
                  <td className="p-2">{detail.kmSekarang}</td>
                </tr>
                <tr>
                  <td className="p-2 bg-gray-800">Keluhan</td>
                  <td className="p-2">{detail.keluhan}</td>
                </tr>
                <tr>
                  <td className="p-2 bg-gray-800">Status Kendaraan</td>
                  <td className="p-2">{detail.statusKendaraan}</td>
                </tr>
                <tr>
                  <td className="p-2 bg-gray-800">Pembayaran</td>
                  <td className="p-2">{detail.jenisPembayaran}</td>
                </tr>
                <tr>
                  <td className="p-2 bg-gray-800">Status Service</td>
                  <td className="p-2">{detail.status}</td>
                </tr>
              </tbody>
            </table>

            {/* === Service === */}
            <table className="w-full text-sm border border-gray-700 mb-4">
              <thead className="bg-gray-800">
                <tr>
                  <th className="p-2 text-left">Keterangan</th>
                  <th className="p-2 text-left">total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2">Jasa Service</td>
                  <td className="p-2 text-left">
                    Rp {detail.biayaServis.toLocaleString("id-ID")}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* === SPAREPART === */}
            <h3 className="font-semibold mb-2">Sparepart</h3>
            <table className="w-full text-sm border border-gray-700 mb-4">
              <thead className="bg-gray-800">
                <tr>
                  <th className="p-2 text-left">Nama</th>
                  <th className="p-2 ">Qty</th>
                  <th className="p-2 text-left">Harga</th>
                  <th className="p-2 text-left">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {detail.sparepart.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-3 text-center text-gray-400">
                      Tidak ada sparepart
                    </td>
                  </tr>
                )}
                {detail.sparepart.map((sp) => (
                  <tr key={sp.id} className="border-t border-gray-700">
                    <td className="p-2">{sp.nama}</td>
                    <td className="p-2 text-center">{sp.qty}</td>
                    <td className="p-2">
                      Rp {sp.harga.toLocaleString("id-ID")}
                    </td>
                    <td className="p-2">
                      Rp {(sp.harga * sp.qty).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* === TOTAL === */}
            <div className="text-right font-bold text-lg mb-4">
              Total Bayar: Rp {detail.totalBayar.toLocaleString("id-ID")}
            </div>

            <button
              onClick={() => setDetail(null)}
              className="w-full bg-gray-700 py-2 rounded"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
