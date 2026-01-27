"use client";

import { useEffect, useRef, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useExportExcel } from "@/hooks/useExportExcel";
import { DateFilter, useDateFilter } from "@/hooks/useDataFilter";

/* ================== TYPES ================== */
type Pelanggan = {
  id: string;
  nama: string;
};

type Kendaraan = {
  id: string;
  pelangganId: string;
  pelangganNama: string;
  nomorPolisi: string;
  nomorRangka: string;
  nomorMesin: string;
  merek: string;
  tipe: string;
  tahunProduksi: number;
  warna: string;
  createdAt?: any;
};

/* ================== PAGE ================== */
export default function KendaraanPage() {
  const [pelanggan, setPelanggan] = useState<Pelanggan[]>([]);
  const [kendaraan, setKendaraan] = useState<Kendaraan[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<DateFilter>("all");

  // modal detail
  const [detail, setDetail] = useState<Kendaraan | null>(null);
  // search
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    pelangganId: "",
    nomorPolisi: "",
    nomorRangka: "",
    nomorMesin: "",
    merek: "",
    tipe: "",
    tahunProduksi: "",
    warna: "",
  });

  const { exportToExcel } = useExportExcel();

  const formRef = useRef<HTMLFormElement>(null);

  /* ================== FETCH ================== */
  useEffect(() => {
    fetchPelanggan();
    fetchKendaraan();
  }, []);

  const fetchPelanggan = async () => {
    const snap = await getDocs(collection(db, "pelanggan"));
    setPelanggan(
      snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }))
    );
  };

  const fetchKendaraan = async () => {
    const snap = await getDocs(collection(db, "kendaraan"));
    setKendaraan(
      snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }))
    );
  };

  /* ================== HANDLER ================== */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setEditId(null);
    setForm({
      pelangganId: "",
      nomorPolisi: "",
      nomorRangka: "",
      nomorMesin: "",
      merek: "",
      tipe: "",
      tahunProduksi: "",
      warna: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const pemilik = pelanggan.find((p) => p.id === form.pelangganId);
    if (!pemilik) return;

    const payload = {
      pelangganId: form.pelangganId,
      pelangganNama: pemilik.nama,
      nomorPolisi: form.nomorPolisi,
      nomorRangka: form.nomorRangka,
      nomorMesin: form.nomorMesin,
      merek: form.merek,
      tipe: form.tipe,
      tahunProduksi: Number(form.tahunProduksi),
      warna: form.warna,
    };

    if (editId) {
      await updateDoc(doc(db, "kendaraan", editId), payload);
    } else {
      await addDoc(collection(db, "kendaraan"), {
        ...payload,
        createdAt: serverTimestamp(),
      });
    }

    resetForm();
    fetchKendaraan();
  };

  const handleEdit = (k: Kendaraan) => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });

    setEditId(k.id);
    setForm({
      pelangganId: k.pelangganId,
      nomorPolisi: k.nomorPolisi,
      nomorRangka: k.nomorRangka,
      nomorMesin: k.nomorMesin,
      merek: k.merek,
      tipe: k.tipe,
      tahunProduksi: k.tahunProduksi.toString(),
      warna: k.warna,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus kendaraan ini?")) return;
    await deleteDoc(doc(db, "kendaraan", id));
    fetchKendaraan();
  };

  /* ================== FILTER ================== */
  const kendaraanFilteredByDate = useDateFilter(
    kendaraan,
    "createdAt",
    filterDate
  );

  const filtered = kendaraanFilteredByDate.filter((k) => {
    const key = search.toLowerCase();
    return (
      k.pelangganNama.toLowerCase().includes(key) ||
      k.nomorPolisi.toLowerCase().includes(key) ||
      k.merek.toLowerCase().includes(key)
    );
  });

  /* ================== UI ================== */
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Data Kendaraan</h1>

      {/* ================= FORM ================= */}
      <form
        onSubmit={handleSubmit}
        ref={formRef}
        className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-8"
      >
        <h2 className="font-semibold mb-4">
          {editId ? "Edit Kendaraan" : "Tambah Kendaraan"}
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <select
            name="pelangganId"
            value={form.pelangganId}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="">Pilih Nama Pemilik</option>
            {pelanggan.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama}
              </option>
            ))}
          </select>

          <input
            name="nomorPolisi"
            placeholder="Nomor Polisi"
            value={form.nomorPolisi}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            name="nomorRangka"
            placeholder="Nomor Rangka (VIN)"
            value={form.nomorRangka}
            onChange={handleChange}
            className="input"
          />
          <input
            name="nomorMesin"
            placeholder="Nomor Mesin"
            value={form.nomorMesin}
            onChange={handleChange}
            className="input"
          />
          <input
            name="merek"
            placeholder="Merek"
            value={form.merek}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            name="tipe"
            placeholder="Tipe"
            value={form.tipe}
            onChange={handleChange}
            className="input"
          />
          <input
            type="number"
            name="tahunProduksi"
            placeholder="Tahun Produksi"
            value={form.tahunProduksi}
            onChange={handleChange}
            className="input"
          />
          <input
            name="warna"
            placeholder="Warna"
            value={form.warna}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div className="mt-4 flex gap-3">
          <button className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded font-semibold">
            {editId ? "Update" : "Simpan"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={resetForm}
              className="border border-gray-600 px-6 py-2 rounded"
            >
              Batal
            </button>
          )}
        </div>
      </form>

      {/* ================= SEARCH ================= */}
      <div className="flex items-center justify-between">
        <input
          placeholder="Cari pemilik / plat / merek..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-4 bg-gray-800 border border-gray-700 rounded px-4 py-2 md:w-1/3"
        />
        <div className="flex items-center gap-4">
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
          <button
            onClick={() => exportToExcel(kendaraan, "data_kendaraan.xlsx")}
            className="px-4 py-2 rounded-md bg-green-400"
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="p-3 text-left">Pemilik</th>
              <th className="p-3 text-left">Plat</th>
              <th className="p-3 text-left">Merek</th>
              <th className="p-3 text-left">Tahun</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((k) => (
              <tr
                key={k.id}
                className="border-t border-gray-700 hover:bg-gray-800"
              >
                <td className="p-3">{k.pelangganNama}</td>
                <td className="p-3">{k.nomorPolisi}</td>
                <td className="p-3">{k.merek}</td>
                <td className="p-3">{k.tahunProduksi}</td>
                <td className="p-3 text-center space-x-2">
                  <button onClick={() => setDetail(k)} className="btn-view">
                    Detail
                  </button>
                  <button onClick={() => handleEdit(k)} className="btn-edit">
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(k.id)}
                    className="btn-delete"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL DETAIL ================= */}
      {detail && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-lg font-bold mb-4">Detail Kendaraan</h2>

            <div className="space-y-2 text-sm">
              <p>
                <b>Pemilik:</b> {detail.pelangganNama}
              </p>
              <p>
                <b>Plat:</b> {detail.nomorPolisi}
              </p>
              <p>
                <b>Merek / Tipe:</b> {detail.merek} {detail.tipe}
              </p>
              <p>
                <b>Rangka:</b> {detail.nomorRangka}
              </p>
              <p>
                <b>Mesin:</b> {detail.nomorMesin}
              </p>
              <p>
                <b>Tahun:</b> {detail.tahunProduksi}
              </p>
              <p>
                <b>Warna:</b> {detail.warna}
              </p>
            </div>

            <div className="mt-4 text-right">
              <button
                onClick={() => setDetail(null)}
                className="bg-red-600 mt-6 w-full border border-gray-600 py-2 rounded hover:bg-gray-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
