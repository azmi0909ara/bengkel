"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";


/* ================= TYPE ================= */

type HistorySparepart = {
  id: string; // stok document id
  nama: string;
  qty: number;
  harga: number;
};

type History = {
  createdAt: Timestamp;
  sparepart: HistorySparepart[];
};

type Row = {
  id: string;
  nama: string;
  sumber: string;
  satuan: string;
  terpakai: number;
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
      const historySnap = await getDocs(collection(db, "history"));
      const resultMap = new Map<string, Row>();

      historySnap.docs.forEach((doc) => {
        const h = doc.data() as History;

        // ===== FILTER TANGGAL =====
        const tgl = h.createdAt?.toDate();
        if (startDate && tgl < new Date(startDate)) return;
        if (endDate && tgl > new Date(endDate + "T23:59:59")) return;

        (h.sparepart || []).forEach((sp) => {
          const stok = stokMap.get(sp.id);

          if (!resultMap.has(sp.id)) {
            resultMap.set(sp.id, {
              id: sp.id,
              nama: stok?.nama_sparepart || sp.nama,
              sumber: stok?.sumber || "-",
              satuan: stok?.satuan || "pcs",
              terpakai: 0,
              totalTerjual: 0,
            });
          }

          const row = resultMap.get(sp.id)!;
          row.terpakai += Number(sp.qty || 0);
          row.totalTerjual += Number(sp.qty || 0) * Number(sp.harga || 0);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-6">
        Loading pendapatan stok...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 space-y-6">
      <div className="flex items-center gap-4">
  <button
    onClick={() => router.back()}
    className="px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700 transition"
  >
    ← Kembali
  </button>

</div>
<h1 className="text-2xl font-bold">Pendapatan Sparepart</h1>

      {/* ================= FILTER ================= */}
      <div className="grid md:grid-cols-4 gap-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="bg-gray-800 border border-gray-700 px-4 py-2 rounded"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="bg-gray-800 border border-gray-700 px-4 py-2 rounded"
        />

        <input
          placeholder="Cari sumber stok..."
          value={searchSumber}
          onChange={(e) => setSearchSumber(e.target.value)}
          className="bg-gray-800 border border-gray-700 px-4 py-2 rounded md:col-span-2"
        />
      </div>

      {/* ================= TOTAL ================= */}
      <div className="bg-gray-900 border border-gray-700 px-6 py-3 rounded-xl w-fit">
        <p className="text-sm text-gray-400">Total Pendapatan</p>
        <p className="text-xl font-bold text-green-400">
          Rp {totalPendapatan.toLocaleString("id-ID")}
        </p>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">Nama</th>
              <th className="px-4 py-3 text-left">Sumber</th>
              <th className="px-4 py-3 text-center">Terpakai</th>
              <th className="px-4 py-3 text-right">Total Terjual</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              filteredRows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-800">
                  <td className="px-4 py-3">{r.nama}</td>
                  <td className="px-4 py-3">{r.sumber}</td>
                  <td className="px-4 py-3 text-center">
                    {r.terpakai} {r.satuan}
                  </td>
                  <td className="px-4 py-3 text-right text-green-400 font-semibold">
                    Rp {r.totalTerjual.toLocaleString("id-ID")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
