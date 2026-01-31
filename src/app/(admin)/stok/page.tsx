"use client";

import { useEffect, useRef, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
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

  base_unit: "PCS" | "LITER";
  stok_base: number;
  pcs_per_pack?: number | null;
  liter_per_pcs?: number | null;
  pack_label?: string;

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
    pack_size: "",
    pack_label: "",
    liter_per_pcs: "",
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

  const generateSearchKey = (...texts: string[]) => {
    const keys = new Set<string>();

    texts.forEach((text) => {
      if (!text) return;

      const clean = text.toUpperCase().trim();

      // prefix full string
      for (let i = 1; i <= clean.length; i++) {
        keys.add(clean.substring(0, i));
      }

      // prefix per kata
      clean.split(" ").forEach((word) => {
        for (let i = 1; i <= word.length; i++) {
          keys.add(word.substring(0, i));
        }
      });
    });

    return Array.from(keys);
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.satuan) {
      alert("Satuan wajib dipilih");
      return;
    }

    if (Number(form.stok) <= 0) {
      alert("Stok harus lebih dari 0");
      return;
    }

    const satuan = form.satuan;
    const packSize = Number(form.pack_size) || 0;
    const literPerPcs = Number(form.liter_per_pcs) || 0;

    // ===== VALIDASI LITER CURAH =====
    if (satuan === "LITER") {
      if (packSize > 0 || form.pack_label.trim() !== "") {
        alert("Oli curah (satuan LITER) tidak boleh menggunakan pack");
        return;
      }
      if (literPerPcs > 0) {
        alert("Oli curah (satuan LITER) tidak perlu isi 'Liter per Botol'");
        return;
      }
    }

    // ===== VALIDASI PACK (untuk busi, sekring, dll) =====
    if (satuan === "PCS" && packSize > 1) {
      if (!form.pack_label.trim()) {
        alert("Label pack wajib diisi (BOX/PACK/KARTON/DUS)");
        return;
      }
      if (!Number.isInteger(Number(form.stok))) {
        alert("Stok pack harus bilangan bulat (tidak boleh desimal)");
        return;
      }
      if (literPerPcs > 0) {
        alert(
          "Barang per pack tidak bisa sekaligus memiliki 'Liter per Botol'"
        );
        return;
      }
    }

    // ===== VALIDASI OLI BOTOL/DRUM (PCS + liter_per_pcs) =====
    if (satuan === "PCS" && literPerPcs > 0) {
      if (packSize > 1) {
        alert("Oli botol/drum tidak boleh menggunakan pack");
        return;
      }
      if (!Number.isInteger(Number(form.stok))) {
        alert("Stok botol/drum harus bilangan bulat");
        return;
      }
    }

    const search_key = generateSearchKey(
      form.no_sparepart,
      form.nama_sparepart,
      form.merk
    );

    const newIdSparepart = editId
      ? form.id_sparepart
      : form.id_sparepart || generateIdSparepart();

    const newKode = editId ? form.kode_sparepart : getNextKodeSparepart(data);

    // ===== HITUNG STOK BASE =====
    let stokFinal = 0;

    if (satuan === "LITER") {
      // Oli curah → langsung dalam liter (boleh desimal)
      stokFinal = Number(form.stok);
    } else if (packSize > 1) {
      // PCS dengan pack → konversi ke base PCS
      stokFinal = Number(form.stok) * packSize;
    } else {
      // PCS biasa atau oli botol → langsung
      stokFinal = Number(form.stok);
    }

    // ===== PAYLOAD =====
    const payload = {
      id_sparepart: newIdSparepart,
      kode_sparepart: newKode,
      no_sparepart: form.no_sparepart,
      nama_sparepart: form.nama_sparepart,
      ngk_no: form.ngk_no || "",
      merk: form.merk,
      kategori: form.kategori,

      base_unit: satuan as "PCS" | "LITER",
      stok_base: stokFinal,

      // Pack info (untuk busi, sekring, dll)
      pcs_per_pack: satuan === "PCS" && packSize > 1 ? packSize : null,
      pack_label:
        satuan === "PCS" && packSize > 1 ? form.pack_label.trim() : null,

      // Liter info (untuk oli botol/drum)
      liter_per_pcs: satuan === "PCS" && literPerPcs > 0 ? literPerPcs : null,

      harga_beli: Number(form.harga_beli),
      harga_jual: Number(form.harga_jual),
      sumber: form.sumber || "",
      search_key,
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

    // Reset form
    setForm({
      id_sparepart: "",
      kode_sparepart: "",
      no_sparepart: "",
      nama_sparepart: "",
      ngk_no: "",
      merk: "",
      kategori: "",
      stok: "",
      satuan: "",
      pack_size: "",
      pack_label: "",
      liter_per_pcs: "",
      harga_beli: "",
      harga_jual: "",
      sumber: "",
    });

    fetchData();
  };

  const handleEdit = (item: Sparepart) => {
    setEditId(item.id);

    // Hitung stok untuk form (kebalikan dari submit)
    let stokForm = item.stok_base;

    if (
      item.base_unit === "PCS" &&
      item.pcs_per_pack &&
      item.pcs_per_pack > 1
    ) {
      // Jika pack, tampilkan dalam satuan pack
      stokForm = Math.floor(item.stok_base / item.pcs_per_pack);
    }

    setForm({
      id_sparepart: item.id_sparepart,
      kode_sparepart: item.kode_sparepart,
      no_sparepart: item.no_sparepart,
      nama_sparepart: item.nama_sparepart,
      ngk_no: item.ngk_no || "",
      merk: item.merk,
      kategori: item.kategori,
      stok: stokForm.toString(),
      satuan: item.base_unit,
      pack_size: item.pcs_per_pack?.toString() || "",
      pack_label: item.pack_label || "",
      liter_per_pcs: item.liter_per_pcs?.toString() || "",
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
    `${item.nama_sparepart} ${item.kode_sparepart} ${item.merk} ${item.no_sparepart}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const sortedData = filteredData.sort((a, b) => {
    const numA = Number(a.kode_sparepart.split("-")[1]);
    const numB = Number(b.kode_sparepart.split("-")[1]);
    return numA - numB;
  });

  // Helper untuk render stok
  const renderStok = (item: Sparepart) => {
    if (item.base_unit === "LITER") {
      return `${item.stok_base} LITER`;
    }

    if (item.pcs_per_pack && item.pcs_per_pack > 1) {
      const packQty = Math.floor(item.stok_base / item.pcs_per_pack);
      const sisaPcs = item.stok_base % item.pcs_per_pack;
      return (
        <>
          {packQty} {item.pack_label}
          {sisaPcs > 0 && ` + ${sisaPcs} PCS`}
          <div className="text-xs text-gray-400">= {item.stok_base} PCS</div>
        </>
      );
    }

    if (item.liter_per_pcs) {
      const totalLiter = item.stok_base * item.liter_per_pcs;
      return (
        <>
          {item.stok_base} Botol
          <div className="text-xs text-gray-400">
            = {totalLiter} Liter ({item.liter_per_pcs}L/btl)
          </div>
        </>
      );
    }

    return `${item.stok_base} PCS`;
  };

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
          placeholder="No Sparepart *"
          className="input"
          value={form.no_sparepart}
          onChange={(e) => setForm({ ...form, no_sparepart: e.target.value })}
          required
        />

        <input
          placeholder="Nama Part *"
          className="input"
          value={form.nama_sparepart}
          onChange={(e) => setForm({ ...form, nama_sparepart: e.target.value })}
          required
        />

        <input
          placeholder="NGK No (opsional)"
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
          <option value="">Pilih Kategori *</option>
          {KATEGORI.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>

        <select
          className="input"
          value={form.satuan}
          onChange={(e) => {
            setForm({
              ...form,
              satuan: e.target.value,
              // Reset pack & liter saat ganti satuan
              pack_size: "",
              pack_label: "",
              liter_per_pcs: "",
            });
          }}
          required
        >
          <option value="">Pilih Satuan *</option>
          <option value="PCS">PCS (satuan barang)</option>
          <option value="LITER">LITER (oli curah)</option>
        </select>

        <input
          type="number"
          step="any"
          placeholder={
            form.satuan === "LITER" ? "Stok (boleh desimal) *" : "Stok *"
          }
          className="input"
          value={form.stok}
          onChange={(e) => setForm({ ...form, stok: e.target.value })}
          required
        />

        {/* PACK - hanya untuk PCS */}
        <input
          type="number"
          placeholder="Isi per pack (kosongkan jika bukan pack)"
          className="input"
          disabled={form.satuan !== "PCS"}
          value={form.pack_size}
          onChange={(e) => setForm({ ...form, pack_size: e.target.value })}
          title="Untuk barang seperti busi per box, sekring per pack, dll"
        />

        <input
          placeholder="Label pack (BOX/PACK/KARTON/DUS)"
          className="input"
          disabled={
            form.satuan !== "PCS" ||
            !form.pack_size ||
            Number(form.pack_size) <= 1
          }
          value={form.pack_label}
          onChange={(e) => setForm({ ...form, pack_label: e.target.value })}
        />

        {/* LITER PER PCS - hanya untuk PCS (oli botol/drum) */}
        <input
          type="number"
          step="0.1"
          placeholder="Liter per Botol/Drum (untuk oli botolan)"
          className="input"
          disabled={
            form.satuan !== "PCS" ||
            (!!form.pack_size && Number(form.pack_size) > 1)
          }
          value={form.liter_per_pcs}
          onChange={(e) => setForm({ ...form, liter_per_pcs: e.target.value })}
          title="Contoh: oli 1 liter, 5 liter, drum 200 liter"
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
          placeholder="Sumber / Supplier (opsional)"
          className="input md:col-span-2"
          rows={2}
          value={form.sumber}
          onChange={(e) => setForm({ ...form, sumber: e.target.value })}
        />

        <button
          type="submit"
          className="md:col-span-2 bg-red-600 hover:bg-red-700 py-3 rounded font-semibold transition"
        >
          {editId ? "💾 Update Sparepart" : "➕ Tambah Sparepart"}
        </button>
      </form>

      {/* SEARCH & FILTER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <input
          placeholder="🔍 Cari sparepart..."
          className="w-full md:w-96 bg-gray-800 border border-gray-700 rounded px-4 py-2"
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
            type="button"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md transition font-semibold"
            onClick={() => exportToExcel(sortedData, "data_stok.xlsx")}
          >
            📊 Export Excel
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
              <th className="px-4 py-3 text-right">Harga Jual</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
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
                      {search
                        ? "Tidak ada hasil pencarian"
                        : "Belum Ada Stok Sparepart"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {search
                        ? `Untuk pencarian: "${search}"`
                        : "Data sparepart akan muncul di sini"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-800 transition">
                  <td className="px-4 py-3 font-mono font-medium text-blue-400">
                    {item.kode_sparepart}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {item.no_sparepart}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {item.nama_sparepart}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{item.kategori}</td>
                  <td className="px-4 py-3 text-center font-medium">
                    {renderStok(item)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-green-400">
                    Rp {item.harga_jual.toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setDetail(item)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-xs transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition"
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-blue-400">
              📋 Detail Sparepart
            </h2>

            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr className="border-b border-gray-700">
                  <td className="py-3 px-4 font-semibold text-gray-400 w-1/3">
                    Kode
                  </td>
                  <td className="py-3 px-4 font-mono text-blue-400">
                    {detail.kode_sparepart}
                  </td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-3 px-4 font-semibold text-gray-400">
                    No Part
                  </td>
                  <td className="py-3 px-4">{detail.no_sparepart}</td>
                </tr>
                {detail.ngk_no && (
                  <tr className="border-b border-gray-700">
                    <td className="py-3 px-4 font-semibold text-gray-400">
                      NGK No
                    </td>
                    <td className="py-3 px-4">{detail.ngk_no}</td>
                  </tr>
                )}
                <tr className="border-b border-gray-700">
                  <td className="py-3 px-4 font-semibold text-gray-400">
                    Nama
                  </td>
                  <td className="py-3 px-4 font-medium">
                    {detail.nama_sparepart}
                  </td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-3 px-4 font-semibold text-gray-400">
                    Merk
                  </td>
                  <td className="py-3 px-4">{detail.merk}</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-3 px-4 font-semibold text-gray-400">
                    Kategori
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-gray-800 rounded text-xs">
                      {detail.kategori}
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-3 px-4 font-semibold text-gray-400">
                    Satuan Dasar
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded text-xs">
                      {detail.base_unit}
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-gray-700 bg-gray-800/50">
                  <td className="py-3 px-4 font-semibold text-gray-400">
                    Stok
                  </td>
                  <td className="py-3 px-4 font-bold text-green-400">
                    {renderStok(detail)}
                  </td>
                </tr>
                {detail.pcs_per_pack && (
                  <tr className="border-b border-gray-700">
                    <td className="py-3 px-4 font-semibold text-gray-400">
                      Info Pack
                    </td>
                    <td className="py-3 px-4">
                      1 {detail.pack_label} = {detail.pcs_per_pack} PCS
                    </td>
                  </tr>
                )}
                {detail.liter_per_pcs && (
                  <tr className="border-b border-gray-700">
                    <td className="py-3 px-4 font-semibold text-gray-400">
                      Volume per Unit
                    </td>
                    <td className="py-3 px-4">
                      {detail.liter_per_pcs} Liter/Botol
                    </td>
                  </tr>
                )}
                <tr className="border-b border-gray-700">
                  <td className="py-3 px-4 font-semibold text-gray-400">
                    Harga Beli
                  </td>
                  <td className="py-3 px-4">
                    Rp {detail.harga_beli.toLocaleString("id-ID")}
                  </td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-3 px-4 font-semibold text-gray-400">
                    Harga Jual
                  </td>
                  <td className="py-3 px-4 font-semibold text-green-400">
                    Rp {detail.harga_jual.toLocaleString("id-ID")}
                  </td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-3 px-4 font-semibold text-gray-400">
                    Margin
                  </td>
                  <td className="py-3 px-4 text-yellow-400">
                    Rp{" "}
                    {(detail.harga_jual - detail.harga_beli).toLocaleString(
                      "id-ID"
                    )}{" "}
                    (
                    {(
                      ((detail.harga_jual - detail.harga_beli) /
                        detail.harga_beli) *
                      100
                    ).toFixed(1)}
                    %)
                  </td>
                </tr>
                {detail.sumber && (
                  <tr>
                    <td className="py-3 px-4 font-semibold text-gray-400 align-top">
                      Sumber
                    </td>
                    <td className="py-3 px-4 text-gray-300">{detail.sumber}</td>
                  </tr>
                )}
              </tbody>
            </table>

            <button
              onClick={() => setDetail(null)}
              className="bg-gray-700 hover:bg-gray-600 mt-6 w-full py-2 rounded transition font-semibold"
            >
              ✕ Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
