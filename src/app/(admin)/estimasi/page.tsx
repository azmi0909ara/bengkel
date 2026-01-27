"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, Timestamp, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import PartSearch, { EPart } from "@/components/service/PartSearch";
import { useSparepart } from "@/hooks/useSparepart";
import { calculateTotal } from "@/lib/calculation";
import { Kendaraan, Pelanggan } from "@/types/service";

/* ================= TYPE ================= */

/* ================= CONST ================= */
const JENIS_PEMBAYARAN = ["Tunai", "Transfer", "QRIS"];

/* ================= PAGE ================= */
export default function EstimasiPage() {
  const { sparepart, addPart, updateQty, removeItem } = useSparepart();
  const [pelanggan, setPelanggan] = useState<Pelanggan[]>([]);
  const [kendaraan, setKendaraan] = useState<Kendaraan[]>([]);

  const [loading, setLoading] = useState(false);
  const [selectedPelanggan, setSelectedPelanggan] = useState("");
  const [selectedKendaraan, setSelectedKendaraan] = useState("");
  const [biayaServisInput, setBiayaServisInput] = useState("");
  const [diskonInput, setDiskonInput] = useState("");

  const biayaServis = Number(biayaServisInput) || 0;
  const diskon = Number(diskonInput) || 0;

  const { totalSparepart, subtotal, totalBayar } = calculateTotal(
    sparepart,
    biayaServis,
    diskon
  );

  const [tanggal, setTanggal] = useState("");
  const [keluhan, setKeluhan] = useState("");
  const [jenisPembayaran, setJenisPembayaran] = useState("Tunai");

  /* ================= FETCH MASTER ================= */
  useEffect(() => {
    const load = async () => {
      const p = await getDocs(collection(db, "pelanggan"));
      const k = await getDocs(collection(db, "kendaraan"));

      setPelanggan(p.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      setKendaraan(k.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    };
    load();
  }, []);

  /* ================= ADD PART ================= */

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const p = pelanggan.find((p) => p.id === selectedPelanggan);
    const k = kendaraan.find((k) => k.id === selectedKendaraan);
    if (!p || !k) {
      setLoading(false);
      return alert("Data tidak valid");
    }

    try {
      await addDoc(collection(db, "estimasi"), {
        tanggal: Timestamp.fromDate(new Date(tanggal)),
        pelangganId: p.id,
        pelangganNama: p.nama,
        kendaraanId: k.id,
        kendaraanLabel: `${k.nomorPolisi} - ${k.merek}`,
        keluhan,
        jenisPembayaran,
        sparepart,
        biayaServis,
        totalSparepart,
        diskon,
        totalBayar,
        status: "ESTIMASI",
        createdAt: Timestamp.now(),
      });

      alert("Estimasi berhasil disimpan");

      /* RESET FORM — TANPA RELOAD */
      setTanggal("");
      setKeluhan("");
      setSelectedPelanggan("");
      setSelectedKendaraan("");
      setBiayaServisInput("");
      setDiskonInput("");
      // sparepart reset tergantung hook
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Estimasi Service
          </h1>
          <p className="text-gray-400">
            Buat estimasi biaya service sebelum pengerjaan
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Form Content */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* Informasi Umum */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Informasi Umum
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tanggal Estimasi
                  </label>
                  <input
                    type="date"
                    className="input w-full bg-gray-800 border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Jenis Pembayaran
                  </label>
                  <select
                    className="input w-full bg-gray-800 border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={jenisPembayaran}
                    onChange={(e) => setJenisPembayaran(e.target.value)}
                  >
                    {JENIS_PEMBAYARAN.map((j) => (
                      <option key={j}>{j}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Data Pelanggan & Kendaraan */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Data Pelanggan & Kendaraan
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Pelanggan
                  </label>
                  <select
                    className="input w-full bg-gray-800 border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={selectedPelanggan}
                    onChange={(e) => setSelectedPelanggan(e.target.value)}
                    required
                  >
                    <option value="">Pilih Pelanggan</option>
                    {pelanggan.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Kendaraan
                  </label>
                  <select
                    className="input w-full bg-gray-800 border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={selectedKendaraan}
                    onChange={(e) => setSelectedKendaraan(e.target.value)}
                    required
                  >
                    <option value="">Pilih Kendaraan</option>
                    {kendaraan
                      .filter((k) => k.pelangganId === selectedPelanggan)
                      .map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.nomorPolisi} - {k.merek}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Detail Service */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Detail Service
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Keluhan / Kebutuhan Service
                </label>
                <textarea
                  className="input w-full bg-gray-800 border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[100px] resize-y"
                  placeholder="Deskripsikan keluhan atau kebutuhan service..."
                  value={keluhan}
                  onChange={(e) => setKeluhan(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Biaya & Sparepart */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Estimasi Biaya & Sparepart
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Biaya Jasa
                  </label>
                  <input
                    type="number"
                    className="input w-full bg-gray-800 border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={biayaServisInput}
                    placeholder="0"
                    min={0}
                    onChange={(e) => setBiayaServisInput(e.target.value)}
                  />
                </div>

                {/* Search Part */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cari Sparepart
                  </label>
                  <PartSearch onAdd={addPart} />
                </div>

                {/* Tabel Sparepart */}
                {sparepart.length > 0 && (
                  <div className="border border-gray-800 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-800">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              Sparepart
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                              Harga
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                              Qty
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                              Subtotal
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider w-12"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {sparepart.map((sp) => (
                            <tr
                              key={sp.id}
                              className="hover:bg-gray-800/50 transition-colors"
                            >
                              <td className="px-4 py-3 text-white">
                                {sp.nama}
                              </td>
                              <td className="px-4 py-3 text-center text-gray-300">
                                Rp {sp.harga.toLocaleString("id-ID")}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="number"
                                  className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-center text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  value={sp.qty}
                                  onChange={(e) =>
                                    updateQty(sp.id, Number(e.target.value))
                                  }
                                />
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-white">
                                Rp {(sp.harga * sp.qty).toLocaleString("id-ID")}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => removeItem(sp.id)}
                                  className="text-red-500 hover:text-red-400 transition-colors"
                                  title="Hapus"
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
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Diskon */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Diskon (Rp)
                  </label>
                  <input
                    type="number"
                    className="input w-full bg-gray-800 border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={diskonInput}
                    placeholder="0"
                    min={0}
                    onChange={(e) => setDiskonInput(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Summary & Submit */}
          <div className="bg-gray-800/50 border-t border-gray-800 px-6 sm:px-8 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="space-y-1">
                <div className="flex justify-between gap-8 text-sm">
                  <span className="text-gray-400">Biaya Jasa:</span>
                  <span className="text-white font-medium">
                    Rp {biayaServis.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between gap-8 text-sm">
                  <span className="text-gray-400">Total Sparepart:</span>
                  <span className="text-white font-medium">
                    Rp {totalSparepart.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between gap-8 text-sm">
                  <span className="text-gray-400">Subtotal:</span>
                  <span className="text-white font-medium">
                    Rp {subtotal.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between gap-8 text-sm">
                  <span className="text-gray-400">Diskon:</span>
                  <span className="text-red-400 font-medium">
                    - Rp {diskon.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400 mb-1">Total Estimasi</p>
                <p className="text-3xl font-bold text-white">
                  Rp {totalBayar.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Simpan Estimasi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
