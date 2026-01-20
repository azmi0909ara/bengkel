'use client'

import { useEffect, useState } from 'react'
import {
  collection,
  getDocs,
  Timestamp,
  runTransaction,
  doc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

/* ================= TYPE ================= */
type Pelanggan = {
  id: string
  nama: string
}

type Kendaraan = {
  id: string
  pelangganId: string
  pelangganNama: string
  nomorPolisi: string
  nomorRangka: string
  nomorMesin: string
  merek: string
  tipe: string
  tahunProduksi: number
  warna: string
  kilometer: number
}

type Stok = {
  id: string
  nama_sparepart: string
  stok: number
  harga_jual: number
}

type SparepartDipakai = {
  id: string
  nama: string
  harga: number
  qty: number
}

/* ================= CONST ================= */
const JENIS_SERVIS = [
  'Servis Ringan',
  'Servis Lengkap',
  'Ganti Oli',
  'Perbaikan Rem',
  'Kelistrikan',
  'Tune Up',
]

const JENIS_PEMBAYARAN = ['Tunai', 'Transfer', 'QRIS']
const STATUS_KENDARAAN = ['DITUNGGU', 'DITINGGAL']

/* ================= PAGE ================= */
export default function ServicePage() {
  const [pelanggan, setPelanggan] = useState<Pelanggan[]>([])
  const [kendaraan, setKendaraan] = useState<Kendaraan[]>([])
  const [stok, setStok] = useState<Stok[]>([])

  const [selectedPelanggan, setSelectedPelanggan] = useState('')
  const [selectedKendaraan, setSelectedKendaraan] = useState('')

  const [tanggal, setTanggal] = useState('')
  const [mekanik, setMekanik] = useState('')
  const [kmSekarang, setKmSekarang] = useState<number>(0)
  const [keluhan, setKeluhan] = useState('')
  const [statusKendaraan, setStatusKendaraan] = useState('DITUNGGU')
  const [jenisPembayaran, setJenisPembayaran] = useState('Tunai')

  const [jenisServis, setJenisServis] = useState<string[]>([])
  const [biayaServis, setBiayaServis] = useState<number>(0)

  const [sparepart, setSparepart] = useState<SparepartDipakai[]>([])

  const [showPreview, setShowPreview] = useState(false)

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const loadData = async () => {
      const pSnap = await getDocs(collection(db, 'pelanggan'))
      const kSnap = await getDocs(collection(db, 'kendaraan'))
      const sSnap = await getDocs(collection(db, 'stok'))

      setPelanggan(pSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
      setKendaraan(kSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
      setStok(sSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
    }
    loadData()
  }, [])

  /* ================= LOGIC ================= */
  const toggleSparepart = (item: Stok) => {
    if (item.stok <= 0) return

    const exists = sparepart.find(sp => sp.id === item.id)

    if (exists) {
      setSparepart(prev => prev.filter(sp => sp.id !== item.id))
    } else {
      setSparepart(prev => [
        ...prev,
        {
          id: item.id,
          nama: item.nama_sparepart,
          harga: item.harga_jual,
          qty: 1,
        },
      ])
    }
  }

  const updateQty = (id: string, qty: number) => {
    setSparepart(prev =>
      prev.map(sp =>
        sp.id === id ? { ...sp, qty: Math.max(1, qty) } : sp
      )
    )
  }

  const totalSparepart = sparepart.reduce(
    (sum, s) => sum + s.harga * s.qty,
    0
  )

  const totalBayar = biayaServis + totalSparepart

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const p = pelanggan.find(p => p.id === selectedPelanggan)
    const k = kendaraan.find(k => k.id === selectedKendaraan)

    if (!p || !k) return alert('Data tidak valid')

    try {
      await runTransaction(db, async tx => {
        for (const sp of sparepart) {
          const stokRef = doc(db, 'stok', sp.id)
          const snap = await tx.get(stokRef)

          const currentStok = snap.data()?.stok ?? 0
          if (currentStok < sp.qty)
            throw new Error(`Stok ${sp.nama} tidak mencukupi`)

          tx.update(stokRef, {
            stok: currentStok - sp.qty,
          })
        }

        const serviceRef = doc(collection(db, 'service'))
        tx.set(serviceRef, {
          tanggal: Timestamp.fromDate(new Date(tanggal)),
          pelangganId: p.id,
          pelangganNama: p.nama,
          kendaraanId: k.id,
          kendaraanLabel: `${k.nomorPolisi} - ${k.merek}`,
          mekanikNama: mekanik,
          kmSekarang,
          keluhan,
          statusKendaraan,
          jenisPembayaran,
          jenisServis,
          sparepart,
          biayaServis,
          totalSparepart,
          totalBayar,
          status: 'MENUNGGU',
          createdAt: Timestamp.now(),
        })
      })

      alert('Service berhasil disimpan')
    } catch (err: any) {
      alert(err.message)
    }
  }

  const p = pelanggan.find(p => p.id === selectedPelanggan)
  const k = kendaraan.find(k => k.id === selectedKendaraan)

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-950 p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Service Kendaraan</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-4"
      >
        {/* --- FORM TETAP --- */}

       <p className="text-sm text-gray-400 mb-2">Tanggal Service</p>
        <input type="date" className="input" value={tanggal} onChange={e => setTanggal(e.target.value)} required />

      <p className="text-sm text-gray-400 mb-2">Data Pelanggan Service</p>
        <select className="input" value={selectedPelanggan} onChange={e => setSelectedPelanggan(e.target.value)}>
          <option value="">Pilih Pelanggan</option>
          {pelanggan.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
        </select>

        <select className="input" value={selectedKendaraan} onChange={e => setSelectedKendaraan(e.target.value)}>
          <option value="">Pilih Kendaraan</option>
          {kendaraan.filter(k => k.pelangganId === selectedPelanggan).map(k => (
            <option key={k.id} value={k.id}>{k.nomorPolisi} - {k.merek}</option>
          ))}
        </select>

        <p className="text-sm text-gray-400 mb-2">Nama Mekanik</p>
        <input className="input" placeholder="Nama Mekanik" value={mekanik} onChange={e => setMekanik(e.target.value)} />
        <p className="text-sm text-gray-400 mb-2">Kilometer</p>
        <input type="number" className="input" placeholder="KM Sekarang" value={kmSekarang} onChange={e => setKmSekarang(Number(e.target.value))} />
        <textarea className="input" placeholder="Permintaan / Keluhan" value={keluhan} onChange={e => setKeluhan(e.target.value)} />
        
        <p className="text-sm text-gray-400 mb-2">Status Kendaraan</p>
        <select className="input" value={statusKendaraan} onChange={e => setStatusKendaraan(e.target.value)}>
          {STATUS_KENDARAAN.map(s => <option key={s}>{s}</option>)}
        </select>
        
        <p className="text-sm text-gray-400 mb-2">Jenis Pembayaran</p>
        <select className="input" value={jenisPembayaran} onChange={e => setJenisPembayaran(e.target.value)}>
          {JENIS_PEMBAYARAN.map(j => <option key={j}>{j}</option>)}
        </select>
        
        <p className="text-sm text-gray-400 mb-2">Biaya Jasa Service</p>
        <input type="number" className="input" placeholder="Biaya Jasa" value={biayaServis} onChange={e => setBiayaServis(Number(e.target.value))} />

        {/* SPAREPART BUTTON */}
        <p className="text-sm text-gray-400 mb-2">Tambah Sparepart</p>
        <div className="flex flex-wrap gap-2">
          {stok.map(s => {
            const active = sparepart.some(sp => sp.id === s.id)
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSparepart(s)}
                className={`px-3 py-1 rounded border ${
                  active ? 'bg-red-600 border-red-500' : 'bg-gray-800 border-gray-700'
                }`}
              >
                {s.nama_sparepart}
              </button>
            )
          })}
        </div>

        {/* TABEL SPAREPART */}
        <table className="w-full text-sm border border-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-2 text-left">Sparepart</th>
              <th className="p-2 text-left">Qty</th>
              <th className="p-2 text-left">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {sparepart.map(sp => (
              <tr key={sp.id} className="border-t border-gray-700">
                <td className="p-2">{sp.nama}</td>
                <td>
                  <input
                    type="number"
                    className="w-16 bg-gray-800 text-center"
                    value={sp.qty}
                    onChange={e => updateQty(sp.id, Number(e.target.value))}
                  />
                </td>
                <td>Rp {(sp.harga * sp.qty).toLocaleString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="font-bold text-right">
          Total Bayar: Rp {totalBayar.toLocaleString('id-ID')}
        </div>

        {/* ACTION BUTTON */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="w-1/2 bg-gray-700 py-2 rounded"
          >
            Preview
          </button>

          <button
            type="submit"
            className="w-1/2 bg-red-600 py-2 rounded"
          >
            Simpan Service
          </button>
        </div>
      </form>

      {/* ================= MODAL PREVIEW ================= */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 w-full max-w-lg rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Preview Service</h2>
            <p><b>Tanggal:</b> {tanggal}</p>
            <p><b>Pelanggan:</b> {p?.nama}</p>
            <p><b>Kendaraan:</b> {k?.nomorPolisi} - {k?.merek}</p>
            <p><b>Permitaan/Keluhan:</b> {keluhan}</p>
            <p><b>Mekanik:</b> {mekanik}</p>
            <p><b>KM:</b> {kmSekarang}</p>
            <p><b>Status Kendaraan:</b> {statusKendaraan}</p>
            <p><b>Jenis Pembayaran:</b> {jenisPembayaran}</p>
            <p><b>Biaya Servis:</b> Rp {biayaServis.toLocaleString('id-ID')}</p>
          

            <hr className="my-3 border-gray-700" />

            {sparepart.map(sp => (
              <p key={sp.id}>
                {sp.nama} x{sp.qty} = Rp {(sp.harga * sp.qty).toLocaleString('id-ID')}
              </p>
            ))}

            <p className="font-bold mt-3">
              Total: Rp {totalBayar.toLocaleString('id-ID')}
            </p>

            <button
              onClick={() => setShowPreview(false)}
              className="mt-4 w-full bg-gray-700 py-2 rounded"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
