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
  merk: string
  platNomor: string
}

type Stok = {
  id: string
  nama: string
  kategori: string
  stok: number
  harga: number
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

/* ================= PAGE ================= */
export default function ServicePage() {
  const [pelanggan, setPelanggan] = useState<Pelanggan[]>([])
  const [kendaraan, setKendaraan] = useState<Kendaraan[]>([])
  const [stok, setStok] = useState<Stok[]>([])

  const [selectedPelanggan, setSelectedPelanggan] = useState('')
  const [selectedKendaraan, setSelectedKendaraan] = useState('')
  const [mekanik, setMekanik] = useState('')

  const [jenisServis, setJenisServis] = useState<string[]>([])
  const [biayaServis, setBiayaServis] = useState('')

  const [sparepart, setSparepart] = useState<SparepartDipakai[]>([])

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const loadData = async () => {
      const p = await getDocs(collection(db, 'pelanggan'))
      const k = await getDocs(collection(db, 'kendaraan'))
      const s = await getDocs(collection(db, 'stok'))

      setPelanggan(p.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
      setKendaraan(k.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
      setStok(s.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
    }
    loadData()
  }, [])

  /* ================= LOGIC ================= */
  const toggleServis = (item: string) => {
    setJenisServis(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    )
  }

  const addSparepart = (item: Stok) => {
    if (item.stok === 0) return
    if (sparepart.find(s => s.id === item.id)) return

    setSparepart(prev => [
      ...prev,
      { id: item.id, nama: item.nama, harga: item.harga, qty: 1 },
    ])
  }

  const updateQty = (index: number, value: number) => {
    setSparepart(prev => {
      const data = [...prev]
      data[index].qty = Math.max(1, value)
      return data
    })
  }

  const removeSparepart = (id: string) => {
    setSparepart(prev => prev.filter(s => s.id !== id))
  }

  const totalSparepart = sparepart.reduce(
    (sum, s) => sum + s.harga * s.qty,
    0
  )

  const totalBayar = Number(biayaServis || 0) + totalSparepart

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const p = pelanggan.find(p => p.id === selectedPelanggan)
    const k = kendaraan.find(k => k.id === selectedKendaraan)

    if (!p || !k) return
    if (!mekanik) return alert('Nama mekanik wajib diisi')
    if (jenisServis.length === 0)
      return alert('Pilih minimal satu jenis servis')

    try {
      await runTransaction(db, async tx => {
        /* ===== READ FIRST ===== */
        const stokUpdates: {
          ref: any
          currentStok: number
          usedQty: number
        }[] = []

        for (const sp of sparepart) {
          const stokRef = doc(db, 'stok', sp.id)
          const snap = await tx.get(stokRef)

          if (!snap.exists()) {
            throw new Error(`Sparepart ${sp.nama} tidak ditemukan`)
          }

          const currentStok = snap.data().stok ?? 0

          if (currentStok < sp.qty) {
            throw new Error(`Stok ${sp.nama} tidak mencukupi`)
          }

          stokUpdates.push({
            ref: stokRef,
            currentStok,
            usedQty: sp.qty,
          })
        }

        /* ===== WRITE ===== */
        const serviceRef = doc(collection(db, 'service'))
        tx.set(serviceRef, {
          pelangganId: p.id,
          pelangganNama: p.nama,
          kendaraanId: k.id,
          kendaraanLabel: `${k.merk} - ${k.platNomor}`,
          mekanikNama: mekanik,
          jenisServis,
          sparepart,
          biayaServis: Number(biayaServis),
          totalSparepart,
          totalBayar,
          status: 'MENUNGGU',
          createdAt: Timestamp.now(),
        })

        for (const s of stokUpdates) {
          tx.update(s.ref, {
            stok: s.currentStok - s.usedQty,
          })
        }
      })

      alert('Service berhasil disimpan')

      setSelectedPelanggan('')
      setSelectedKendaraan('')
      setMekanik('')
      setJenisServis([])
      setSparepart([])
      setBiayaServis('')
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan service')
    }
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Service Kendaraan</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-6"
      >
        {/* PELANGGAN */}
        <select
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
          value={selectedPelanggan}
          onChange={e => setSelectedPelanggan(e.target.value)}
          required
        >
          <option value="">Pilih Pelanggan</option>
          {pelanggan.map(p => (
            <option key={p.id} value={p.id}>
              {p.nama}
            </option>
          ))}
        </select>

        {/* KENDARAAN */}
        <select
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
          value={selectedKendaraan}
          onChange={e => setSelectedKendaraan(e.target.value)}
          required
        >
          <option value="">Pilih Kendaraan</option>
          {kendaraan
            .filter(k => k.pelangganId === selectedPelanggan)
            .map(k => (
              <option key={k.id} value={k.id}>
                {k.merk} - {k.platNomor}
              </option>
            ))}
        </select>

        {/* MEKANIK */}
        <input
          placeholder="Nama Mekanik"
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
          value={mekanik}
          onChange={e => setMekanik(e.target.value)}
          required
        />

        {/* JENIS SERVIS */}
        <div>
          <p className="text-sm text-gray-400 mb-2">Jenis Servis</p>
          <div className="grid grid-cols-2 gap-2">
            {JENIS_SERVIS.map(j => (
              <label
                key={j}
                className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded px-3 py-2"
              >
                <input
                  type="checkbox"
                  checked={jenisServis.includes(j)}
                  onChange={() => toggleServis(j)}
                />
                {j}
              </label>
            ))}
          </div>
        </div>

        {/* BIAYA */}
        <input
          type="number"
          placeholder="Biaya Jasa Servis"
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
          value={biayaServis}
          onChange={e => setBiayaServis(e.target.value)}
          required
        />

        {/* SPAREPART */}
        <div>
          <p className="text-sm text-gray-400 mb-2">Tambah Sparepart</p>
          <div className="flex flex-wrap gap-2">
            {stok.map(s => (
              <button
                type="button"
                key={s.id}
                disabled={s.stok === 0}
                onClick={() => addSparepart(s)}
                className={`px-3 py-1 border rounded ${
                  s.stok === 0
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {s.nama}
              </button>
            ))}
          </div>
        </div>

        {/* LIST SPAREPART */}
        {sparepart.map((s, i) => (
          <div
            key={s.id}
            className="flex items-center justify-between bg-gray-800 p-3 rounded"
          >
            <div>
              <p className="font-semibold">{s.nama}</p>
              <p className="text-sm text-gray-400">
                Rp {s.harga.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateQty(i, s.qty - 1)}
                className="px-2 bg-gray-700 rounded"
              >
                -
              </button>
              <span>{s.qty}</span>
              <button
                type="button"
                onClick={() => updateQty(i, s.qty + 1)}
                className="px-2 bg-gray-700 rounded"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => removeSparepart(s.id)}
                className="ml-2 px-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30"
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        {/* TOTAL */}
        <div className="bg-black/40 border border-gray-700 rounded p-4 text-sm">
          <p>
            Total Sparepart: Rp{' '}
            {totalSparepart.toLocaleString('id-ID')}
          </p>
          <p className="text-lg font-bold text-red-500">
            Total Bayar: Rp {totalBayar.toLocaleString('id-ID')}
          </p>
        </div>

        <button className="w-full bg-red-600 hover:bg-red-700 transition rounded py-2 font-semibold">
          Simpan Service
        </button>
      </form>
    </div>
  )
}
