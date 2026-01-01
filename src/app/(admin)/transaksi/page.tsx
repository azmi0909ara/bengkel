'use client'

import { useEffect, useState } from 'react'
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import InvoiceModal from './components/InvoiceModal'

/* ================= TYPE ================= */
type Service = {
  id: string
  tanggal: any
  pelangganId: string
  pelangganNama: string
  kendaraanId: string
  kendaraanLabel: string
  mekanikNama: string
  kmSekarang: number
  keluhan: string
  statusKendaraan: string
  jenisPembayaran: string
  jenisServis: string[]
  sparepart: {
    id: string
    nama: string
    harga: number
    qty: number
  }[]
  biayaServis: number
  totalSparepart: number
  totalBayar: number
  status: 'MENUNGGU' | 'SELESAI'
  createdAt: any
}

type Pelanggan = {
  id: string
  nama: string
  noHp1: string
  noHp2: string
  nik: string
  birthdate: string
  gender: string
  email: string
  alamat1: string
  kodePos: string
  ibuKota: string
  alamat2: string
}

type Kendaraan = {
  id: string
  pelangganId: string
  nomorPolisi: string
  nomorRangka: string
  nomorMesin: string
  merek: string
  tipe: string
  tahunProduksi: number
  warna: string
  kilometer: number
}

/* ================= PAGE ================= */
export default function TransaksiPage() {
  const [service, setService] = useState<Service[]>([])
  const [pelanggan, setPelanggan] = useState<Pelanggan[]>([])
  const [kendaraan, setKendaraan] = useState<Kendaraan[]>([])
  const [showInvoice, setShowInvoice] = useState(false)
  


  const [detail, setDetail] = useState<Service | null>(null)

  /* ================= FETCH ================= */
  useEffect(() => {
    const load = async () => {
      const sSnap = await getDocs(collection(db, 'service'))
      const pSnap = await getDocs(collection(db, 'pelanggan'))
      const kSnap = await getDocs(collection(db, 'kendaraan'))

      setService(sSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
      setPelanggan(pSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
      setKendaraan(kSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
    }
    load()
  }, [])

  /* ================= ACTION ================= */
  const markSelesai = async (id: string) => {
    await updateDoc(doc(db, 'service', id), {
      status: 'SELESAI',
    })
    setService(prev =>
      prev.map(s => (s.id === id ? { ...s, status: 'SELESAI' } : s))
    )
  }

  const clearToHistory = async (data: Service) => {
    await setDoc(doc(db, 'history', data.id), {
      ...data,
      clearedAt: Timestamp.now(),
    })

    await deleteDoc(doc(db, 'service', data.id))

    setService(prev => prev.filter(s => s.id !== data.id))
    setDetail(null)
  }

  const p = pelanggan.find(p => p.id === detail?.pelangganId)
  const k = kendaraan.find(k => k.id === detail?.kendaraanId)

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-950 p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Transaksi Service</h1>

      <table className="w-full text-sm border border-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-2 text-left">Tanggal</th>
            <th className="p-2 text-left">Pelanggan</th>
            <th className="p-2 text-left">Kendaraan</th>
            <th className="p-2 text-left">Total</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {service.map(s => (
            <tr key={s.id} className="border-t border-gray-700">
              <td className="p-2">
                {s.tanggal?.toDate().toLocaleDateString('id-ID')}
              </td>
              <td className="p-2">{s.pelangganNama}</td>
              <td className="p-2">{s.kendaraanLabel}</td>
            
              <td className="p-2">
                Rp {s.totalBayar.toLocaleString('id-ID')}
              </td>
              <td className="p-2">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    s.status === 'SELESAI'
                      ? 'bg-green-600'
                      : 'bg-yellow-600'
                  }`}
                >
                  {s.status}
                </span>
              </td>
              <td className="p-2 flex gap-2">
                <button
                  onClick={() => setDetail(s)}
                  className="px-2 py-1 bg-gray-700 rounded"
                >
                  Detail
                </button>
                {s.status === 'MENUNGGU' && (
                  <button
                    onClick={() => markSelesai(s.id)}
                    className="px-2 py-1 bg-green-600 rounded"
                  >
                    Selesai
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= MODAL DETAIL ================= */}
      {detail && (
  <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
    <div className="bg-gray-900 w-full max-w-3xl rounded-xl p-6 max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Detail Transaksi Service</h2>

      {/* ================= PELANGGAN ================= */}
      <p className="font-semibold mb-2">👥 Data Pelanggan</p>
      <table className="w-full text-sm border border-gray-700 mb-4">
        <tbody>
          <tr><td className="p-2 border">Nama</td><td className="p-2 border">{p?.nama}</td></tr>
          <tr><td className="p-2 border">No HP 1</td><td className="p-2 border">{p?.noHp1}</td></tr>
          <tr><td className="p-2 border">No HP 2</td><td className="p-2 border">{p?.noHp2}</td></tr>
          <tr><td className="p-2 border">NIK</td><td className="p-2 border">{p?.nik}</td></tr>
          <tr><td className="p-2 border">Tanggal Lahir</td><td className="p-2 border">{p?.birthdate}</td></tr>
          <tr><td className="p-2 border">Gender</td><td className="p-2 border">{p?.gender}</td></tr>
          <tr><td className="p-2 border">Email</td><td className="p-2 border">{p?.email}</td></tr>
          <tr><td className="p-2 border">Alamat</td><td className="p-2 border">{p?.alamat1}</td></tr>
          <tr><td className="p-2 border">Alamat 2</td><td className="p-2 border">{p?.alamat2}</td></tr>
        </tbody>
      </table>

      {/* ================= KENDARAAN ================= */}
      <p className="font-semibold mb-2">🚘 Data Kendaraan</p>
      <table className="w-full text-sm border border-gray-700 mb-4">
        <tbody>
          <tr><td className="p-2 border">Nomor Polisi</td><td className="p-2 border">{k?.nomorPolisi}</td></tr>
          <tr><td className="p-2 border">Merek / Tipe</td><td className="p-2 border">{k?.merek} {k?.tipe}</td></tr>
          <tr><td className="p-2 border">Warna</td><td className="p-2 border">{k?.warna}</td></tr>
          <tr><td className="p-2 border">Tahun</td><td className="p-2 border">{k?.tahunProduksi}</td></tr>
          <tr><td className="p-2 border">KM Masuk</td><td className="p-2 border">{detail.kmSekarang}</td></tr>
        </tbody>
      </table>

      {/* ================= SERVICE ================= */}
      <p className="font-semibold mb-2">🛠 Data Service</p>
      <table className="w-full text-sm border border-gray-700 mb-4">
        <tbody>
          <tr><td className="p-2 border">Tanggal</td><td className="p-2 border">{detail.tanggal?.toDate().toLocaleDateString('id-ID')}</td></tr>
          <tr><td className="p-2 border">Mekanik</td><td className="p-2 border">{detail.mekanikNama}</td></tr>
          <tr><td className="p-2 border">Keluhan</td><td className="p-2 border">{detail.keluhan}</td></tr>
          <tr><td className="p-2 border">Status Kendaraan</td><td className="p-2 border">{detail.statusKendaraan}</td></tr>
          <tr><td className="p-2 border">Pembayaran</td><td className="p-2 border">{detail.jenisPembayaran}</td></tr>
          <tr>
            <td className="p-2 border">Status Service</td>
            <td className="p-2 border">
              <span className={`px-2 py-1 rounded text-xs ${
                detail.status === 'SELESAI' ? 'bg-green-600' : 'bg-yellow-600'
              }`}>
                {detail.status}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ================= SPAREPART ================= */}
      <p className="font-semibold mb-2">🔩 Sparepart</p>
      <table className="w-full text-sm border border-gray-700 mb-4">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-2 text-left">Nama</th>
            <th className="p-2 text-center">Qty</th>
            <th className="p-2 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {detail.sparepart.length === 0 && (
            <tr>
              <td colSpan={3} className="p-2 text-center text-gray-400">
                Tidak ada sparepart
              </td>
            </tr>
          )}
          {detail.sparepart.map(sp => (
            <tr key={sp.id} className="border-t border-gray-700">
              <td className="p-2">{sp.nama}</td>
              <td className="p-2 text-center">{sp.qty}</td>
              <td className="p-2 text-right">
                Rp {(sp.harga * sp.qty).toLocaleString('id-ID')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

     <h2 className="font-semibold mb-1">Layanan / Jasa</h2>
        <table className="w-full text-sm border border-gray-700 mb-4">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-2 text-left">Layanan</th>
              <th className=" p-2 text-right w-32">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2">Jasa Service</td>
              <td className="p-2 text-right">
                Rp {detail.biayaServis.toLocaleString('id-ID')}
              </td>
            </tr>
          </tbody>
        </table>

      <p className="text-right font-bold mb-4">
        Total Bayar: Rp {detail.totalBayar.toLocaleString('id-ID')}
      </p>

      <div className="flex gap-2">
        <button
        onClick={() => setShowInvoice(true)}
        className="w-1/2 bg-blue-600 py-2 rounded"
      >
        Print Invoice
        </button>

        <button
          onClick={() => clearToHistory(detail)}
          className="w-1/2 bg-red-600 py-2 rounded"
        >
          Clear → History
        </button>
        <button
          onClick={() => setDetail(null)}
          className="w-1/2 bg-gray-700 py-2 rounded"
        >
          Tutup
        </button>

<InvoiceModal
  open={showInvoice}
  onClose={() => setShowInvoice(false)}
  service={detail}
  pelanggan={p}
  kendaraan={k}
/>

      </div>
    </div>
  </div>
)}
    </div>
  )
}
