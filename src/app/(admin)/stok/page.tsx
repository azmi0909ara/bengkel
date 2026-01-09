"use client";

import { useEffect, useRef, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useExportExcel } from "@/hooks/useExportExcel";
import { DateFilter, useDateFilter } from "@/hooks/useDataFilter";

type Sparepart = {
  id: string;
  id_sparepart: string;
  kode_sparepart: string;
  no_sparepart: string;
  nama_sparepart: string;
  ngk_no: string;
  merk: string;
  kategori: string;
  stok: number;
  satuan: string;
  harga_beli: number;
  harga_jual: number;
  sumber: string;
};

const KATEGORI = [
  "Mesin",
  "Pengereman",
  "Kelistrikan",
  "Suspensi & Kemudi",
  "Sistem AC",
  "Lain-lain",
];

export default function StokPage() {
  const [data, setData] = useState<Sparepart[]>([]);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Sparepart | null>(null);
  const [filterDate, setFilterDate] = useState<DateFilter>("all");

  const { exportToExcel } = useExportExcel();
  const filterData = useDateFilter(data, "createdAt", filterDate);

  const formRef = useRef<HTMLFormElement>(null);

  const [form, setForm] = useState({
    id_sparepart: "",
    kode_sparepart: "",
    no_sparepart: "",
    nama_sparepart: "",
    ngk_no: "",
    merk: "",
    kategori: "",
    stok: "",
    satuan: "",
    harga_beli: "",
    harga_jual: "",
    sumber: "",
  });

  // ================= FETCH =================
  const fetchData = async () => {
    const snap = await getDocs(collection(db, "stok"));
    setData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateIdSparepart = () => `SP-${Date.now()}`;

  const getNextKodeSparepart = (data: Sparepart[]) => {
    const numbers = data
      .map((d) => Number(d.kode_sparepart?.split("-")[1]))
      .filter((n) => !isNaN(n))
      .sort((a, b) => a - b);

    for (let i = 1; i <= numbers.length; i++) {
      if (!numbers.includes(i)) return `KP-${String(i).padStart(3, "0")}`;
    }

    const last = numbers[numbers.length - 1] || 0;
    return `KP-${String(last + 1).padStart(3, "0")}`;
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newIdSparepart = editId
      ? form.id_sparepart
      : form.id_sparepart || generateIdSparepart();

    const newKode = editId ? form.kode_sparepart : getNextKodeSparepart(data);

    const payload = {
      id_sparepart: newIdSparepart,
      kode_sparepart: newKode,
      no_sparepart: form.no_sparepart,
      nama_sparepart: form.nama_sparepart,
      ngk_no: form.ngk_no || "",
      merk: form.merk,
      kategori: form.kategori,
      stok: Number(form.stok),
      satuan: form.satuan,
      harga_beli: Number(form.harga_beli),
      harga_jual: Number(form.harga_jual),
      sumber: form.sumber || "",
    };

    if (editId) {
      await updateDoc(doc(db, "stok", editId), payload);
      setEditId(null);
    } else {
      await addDoc(collection(db, "stok"), {
        ...payload,
        createdAt: serverTimestamp(),
      });
    }

    setForm({
      id_sparepart: generateIdSparepart(),
      kode_sparepart: getNextKodeSparepart(data),
      no_sparepart: "",
      nama_sparepart: "",
      ngk_no: "",
      merk: "",
      kategori: "",
      stok: "",
      satuan: "",
      harga_beli: "",
      harga_jual: "",
      sumber: "",
    });

    fetchData();
  };

  const handleEdit = (item: Sparepart) => {
    setEditId(item.id);
    setForm({
      id_sparepart: item.id_sparepart,
      kode_sparepart: item.kode_sparepart,
      no_sparepart: item.no_sparepart,
      nama_sparepart: item.nama_sparepart,
      ngk_no: item.ngk_no,
      merk: item.merk,
      kategori: item.kategori,
      stok: item.stok.toString(),
      satuan: item.satuan,
      harga_beli: item.harga_beli.toString(),
      harga_jual: item.harga_jual.toString(),
      sumber: item.sumber,
    });

    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus sparepart ini?")) return;
    await deleteDoc(doc(db, "stok", id));
    fetchData();
  };

  // ================= FILTER =================
  const filteredData = filterData.filter((item) =>
    `${item.nama_sparepart} ${item.kode_sparepart} ${item.merk}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const sortedData = filteredData.sort((a, b) => {
    const numA = Number(a.kode_sparepart.split("-")[1]);
    const numB = Number(b.kode_sparepart.split("-")[1]);
    return numA - numB;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Stok Sparepart</h1>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        ref={formRef}
        className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-8 grid md:grid-cols-2 gap-4"
      >
        <input
          placeholder="No Sparepart"
          className="input"
          value={form.no_sparepart}
          onChange={(e) => setForm({ ...form, no_sparepart: e.target.value })}
          required
        />
        <input
          placeholder="Nama Sparepart"
          className="input"
          value={form.nama_sparepart}
          onChange={(e) => setForm({ ...form, nama_sparepart: e.target.value })}
          required
        />
         <input
          placeholder="NGK No"
          className="input"
          value={form.ngk_no}
          onChange={(e) => setForm({ ...form, ngk_no: e.target.value })}
        />
        <input
          placeholder="Merk"
          className="input"
          value={form.merk}
          onChange={(e) => setForm({ ...form, merk: e.target.value })}
        />

        <select
          className="input"
          value={form.kategori}
          onChange={(e) => setForm({ ...form, kategori: e.target.value })}
          required
        >
          <option value="">Pilih Kategori</option>
          {KATEGORI.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Stok"
          className="input"
          value={form.stok}
          onChange={(e) => setForm({ ...form, stok: e.target.value })}
          required
        />
        <input
          placeholder="Satuan (pcs / set)"
          className="input"
          value={form.satuan}
          onChange={(e) => setForm({ ...form, satuan: e.target.value })}
        />

        <input
          type="number"
          placeholder="Harga Beli"
          className="input"
          value={form.harga_beli}
          onChange={(e) => setForm({ ...form, harga_beli: e.target.value })}
        />
        <input
          type="number"
          placeholder="Harga Jual"
          className="input"
          value={form.harga_jual}
          onChange={(e) => setForm({ ...form, harga_jual: e.target.value })}
        />

        <textarea
          placeholder="Sumber"
          className="input md:col-span-2"
          value={form.sumber}
          onChange={(e) => setForm({ ...form, sumber: e.target.value })}
        />

        <button className="md:col-span-2 bg-red-600 hover:bg-red-700 py-2 rounded font-semibold">
          {editId ? "Update Sparepart" : "Tambah Sparepart"}
        </button>
      </form>

      {/* SEARCH */}
      <div className="flex items-center justify-between">
        <input
          placeholder="Cari sparepart..."
          className="mb-4 bg-gray-800 border border-gray-700 rounded px-4 py-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
            className="px-4 py-2 bg-green-400 rounded-md"
            onClick={() => exportToExcel(sortedData, "data_stok.xlsx")}
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-gray-300 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Kode</th>
              <th className="px-4 py-3 text-left">No Sparepart</th>
              <th className="px-4 py-3 text-left">Nama</th>
              <th className="px-4 py-3 text-left">Kategori</th>
              <th className="px-4 py-3 text-center">Stok</th>
              <th className="px-4 py-3 text-left">Harga Jual</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
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
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    <p className="text-lg font-medium text-gray-300">
                      Belum Ada Stok Sparepart
                    </p>
                    <p className="text-sm text-gray-500">
                      Data sparepart akan muncul di sini
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-800 transition">
                  <td className="px-4 py-3 font-medium">
                    {item.kode_sparepart}
                  </td>
                  <td className="px-4 py-3">{item.no_sparepart}</td>
                  <td className="px-4 py-3 font-medium">
                    {item.nama_sparepart}
                  </td>
                  <td className="px-4 py-3">{item.kategori}</td>
                  <td className="px-4 py-3 text-center">{item.stok}</td>
                  <td className="px-4 py-3">
                    Rp {item.harga_jual.toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setDetail(item)}
                        className="btn-view"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="btn-edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="btn-delete"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DETAIL */}
      {detail && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-lg font-bold mb-4">Detail Sparepart</h2>
            <div className="space-y-2 text-sm">
              <table className="w-full text-sm border border-gray-700">
  <tbody>
    <tr>
      <td className="border p-2 font-semibold">Kode</td>
      <td className="border p-2">{detail.kode_sparepart}</td>
    </tr>
    <tr>
      <td className="border p-2 font-semibold">No Part</td>
      <td className="border p-2">{detail.no_sparepart}</td>
    </tr>
    <tr>
      <td className="border p-2 font-semibold">Ngk No</td>
      <td className="border p-2">{detail.ngk_no}</td>
    </tr>
    <tr>
      <td className="border p-2 font-semibold">Nama</td>
      <td className="border p-2">{detail.nama_sparepart}</td>
    </tr>
    <tr>
      <td className="border p-2 font-semibold">Merek</td>
      <td className="border p-2">{detail.merk}</td>
    </tr>
    <tr>
      <td className="border p-2 font-semibold">Kode</td>
      <td className="border p-2">{detail.kode_sparepart}</td>
    </tr>
    <tr>
      <td className="border p-2 font-semibold">Kategori</td>
      <td className="border p-2">{detail.kategori}</td>
    </tr>
    <tr>
      <td className="border p-2 font-semibold">Stok</td>
      <td className="border p-2">
        {detail.stok} {detail.satuan}
      </td>
    </tr>
    <tr>
      <td className="border p-2 font-semibold">Harga Beli</td>
      <td className="border p-2">
        Rp {detail.harga_beli.toLocaleString('id-ID')}
      </td>
    </tr>
    <tr>
      <td className="border p-2 font-semibold">Harga Jual</td>
      <td className="border p-2">
        Rp {detail.harga_jual.toLocaleString('id-ID')}
      </td>
    </tr>
    <tr>
      <td className="border p-2 font-semibold">sumber</td>
      <td className="border p-2">{detail.sumber}</td>
    </tr>
  </tbody>
</table>

            </div>

            <button
              onClick={() => setDetail(null)}
              className="bg-red-600 mt-6 w-full border border-gray-600 py-2 rounded hover:bg-gray-800"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
