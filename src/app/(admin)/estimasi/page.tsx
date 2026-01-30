"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  Timestamp,
  addDoc,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import PartSearch, { EPart } from "@/components/service/PartSearch";
import { useSparepart } from "@/hooks/useSparepart";
import { calculateTotal } from "@/lib/calculation";
import { Estimasi, Kendaraan, Pelanggan } from "@/types/service";
import EstimasiPrint from "../transaksi/components/EstimasiPrint";

/* ================= CONST ================= */
const JENIS_PEMBAYARAN = ["Tunai", "Transfer", "QRIS"];

/* ================= PAGE ================= */
export default function EstimasiPage() {
  const { sparepart, addPart, updateQty, removeItem, updateUnit } =
    useSparepart();
  const [pelanggan, setPelanggan] = useState<Pelanggan[]>([]);
  const [kendaraan, setKendaraan] = useState<Kendaraan[]>([]);

  const [loading, setLoading] = useState(false);
  const [lastEstimasiId, setLastEstimasiId] = useState<string | null>(null);
  const [selectedPelanggan, setSelectedPelanggan] = useState("");
  const [selectedKendaraan, setSelectedKendaraan] = useState("");
  const [biayaServisInput, setBiayaServisInput] = useState("");
  const [diskonInput, setDiskonInput] = useState("");
  const [lastEstimasi, setLastEstimasi] = useState<Estimasi | null>(null);
  const [showModal, setShowModal] = useState(false);

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
      const docRef = await addDoc(collection(db, "estimasi"), {
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

      setLastEstimasiId(docRef.id);
      setShowModal(true);

      alert("Estimasi berhasil disimpan");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!lastEstimasiId) return;

    const loadEstimasi = async () => {
      const snap = await getDoc(doc(db, "estimasi", lastEstimasiId));
      if (!snap.exists()) return;

      const data = snap.data() as Omit<Estimasi, "id">;

      setLastEstimasi({
        id: snap.id,
        ...data,
      });
    };

    loadEstimasi();
  }, [lastEstimasiId]);

  const handleCreateNew = () => {
    setShowModal(false);
    setLastEstimasi(null);
    setLastEstimasiId(null);
    setSelectedPelanggan("");
    setSelectedKendaraan("");
    setBiayaServisInput("");
    setDiskonInput("");
    setTanggal("");
    setKeluhan("");
    setJenisPembayaran("Tunai");
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

        {/* Success Banner - Tampil jika ada estimasi terakhir */}
        {lastEstimasi && !showModal && (
          <div className="bg-green-900/20 border border-green-700 rounded-xl p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-600 rounded-full p-2 flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-white"
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
                </div>
                <div className="min-w-0">
                  <p className="text-white font-semibold">
                    Estimasi berhasil dibuat!
                  </p>
                  <p className="text-gray-400 text-sm truncate">
                    ID: {lastEstimasi.id} - {lastEstimasi.pelangganNama}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowModal(true)}
                  className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm"
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  Lihat/Print
                </button>
                <button
                  onClick={handleCreateNew}
                  className="flex-1 sm:flex-none bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Buat Baru
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Print */}
        {showModal && lastEstimasi && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-800">
              <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 flex justify-between items-center z-10">
                <h3 className="text-xl font-semibold text-white">
                  Estimasi Berhasil Dibuat
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
                >
                  <svg
                    className="w-6 h-6"
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
              </div>
              <div className="p-6">
                <EstimasiPrint service={lastEstimasi} />
              </div>
            </div>
          </div>
        )}

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
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[100px] resize-y"
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
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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

                <div className="mb-3">
                  <a
                    href="https://www.suzuki.co.id/eparts/ertiga-type-1-2-3/engine/figure/18503"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
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
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    Go to Suzuki E-Parts
                  </a>
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
                                  className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-center text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                  value={sp.qty}
                                  min={1}
                                  onChange={(e) =>
                                    updateQty(sp.id, Number(e.target.value))
                                  }
                                />
                                <select
                                  value={sp.unit}
                                  onChange={(e) =>
                                    updateUnit(
                                      sp.id,
                                      e.target.value as "PCS" | "PACK" | "LITER"
                                    )
                                  }
                                  className="ml-2 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-white"
                                >
                                  {/* BASE UNIT PCS */}
                                  {sp.baseUnit === "PCS" && (
                                    <>
                                      <option value="PCS">PCS</option>
                                      {sp.pack_size && (
                                        <option value="PACK">
                                          PACK ({sp.pack_size} PCS)
                                        </option>
                                      )}
                                    </>
                                  )}

                                  {/* BASE UNIT LITER */}
                                  {sp.baseUnit === "LITER" && (
                                    <>
                                      <option value="LITER">LITER</option>
                                      {sp.liter_per_pcs && (
                                        <option value="PCS">
                                          BOTOL ({sp.liter_per_pcs}L)
                                        </option>
                                      )}
                                    </>
                                  )}
                                </select>
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
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
              <div className="space-y-1 w-full sm:w-auto">
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
              <div className="text-right w-full sm:w-auto">
                <p className="text-sm text-gray-400 mb-1">Total Estimasi</p>
                <p className="text-3xl font-bold text-white">
                  Rp {totalBayar.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
              {loading ? "Menyimpan..." : "Simpan Estimasi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
