"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Stok = {
  id: string;
  nama: string;
  stok: number;
};

type Service = {
  id: string;
  totalBayar: number;
  status: string;
};

export default function Dashboard() {
  const [stok, setStok] = useState<Stok[]>([]);
  const [service, setService] = useState<Service[]>([]);
  const [history, setHistory] = useState<Service[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Stok
      const stokSnap = await getDocs(collection(db, "stok"));
      setStok(stokSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));

      // Service
      const serviceSnap = await getDocs(collection(db, "service"));
      setService(
        serviceSnap.docs.map((d) => ({
          id: d.id,
          totalBayar: Number(d.data().totalBayar || 0),
          status: d.data().status || "MENUNGGU",
        }))
      );

      // History
      const historySnap = await getDocs(collection(db, "history"));
      setHistory(
        historySnap.docs.map((d) => ({
          id: d.id,
          totalBayar: Number(d.data().totalBayar || 0),
          status: d.data().status || "SELESAI",
        }))
      );
    };
    fetchData();
  }, []);

  // Hitung total pendapatan
  const totalPendapatanService = service.reduce(
    (sum, s) => sum + s.totalBayar,
    0
  );
  const totalPendapatanHistory = history.reduce(
    (sum, s) => sum + s.totalBayar,
    0
  );
  const totalPendapatanAll = totalPendapatanService + totalPendapatanHistory;

  const totalService = service.length;
  const selesaiCount = service.filter((s) => s.status === "SELESAI").length;
  const menungguCount = service.filter((s) => s.status === "MENUNGGU").length;
  const barangHabis = stok.filter((s) => s.stok === 0).length;
  const barangTersedia = stok.filter((s) => s.stok > 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 text-white space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Service */}
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
          <p className="text-sm text-gray-400">Total Service</p>
          <p className="text-2xl font-bold">{totalService}</p>
          <p className="text-green-400">Selesai: {selesaiCount}</p>
          <p className="text-yellow-400">Menunggu: {menungguCount}</p>
        </div>

        {/* Stok Barang */}
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
          <p className="text-sm text-gray-400">Stok Barang</p>
          <p className="text-2xl font-bold">{stok.length}</p>
          <p className="text-red-400">Habis: {barangHabis}</p>
          <p className="text-green-400">Tersedia: {barangTersedia}</p>
        </div>

        {/* Total Pendapatan Service Aktif */}
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
          <p className="text-sm text-gray-400">Pendapatan Saat Ini</p>
          <p className="text-2xl font-bold text-red-500">
            Rp {totalPendapatanService.toLocaleString("id-ID")}
          </p>
        </div>

        {/* Total Pendapatan Keseluruhan */}
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
          <p className="text-sm text-gray-400">
            Pendapatan Total (Service + History)
          </p>
          <p className="text-2xl font-bold text-red-500">
            Rp {totalPendapatanAll.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* Latest Services Table */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-gray-300 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">ID Service</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Total Bayar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {service.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <svg
                        className="w-12 h-12"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                        />
                      </svg>
                      <p className="text-base font-medium text-gray-300">
                        Belum Ada Service
                      </p>
                      <p className="text-xs text-gray-500">
                        Data service terbaru akan muncul di sini
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                service.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-800 transition">
                    <td className="px-4 py-3">{s.id}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          s.status === "SELESAI"
                            ? "bg-green-600/20 text-green-400 border border-green-600/30"
                            : "bg-yellow-600/20 text-yellow-400 border border-yellow-600/30"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      Rp {s.totalBayar.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
