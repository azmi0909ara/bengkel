'use client'

import { useEffect, useState } from 'react'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

type Pelanggan = {
  id: string
  nama: string
}

type Kendaraan = {
  id: string
  pelangganId: string
  pelangganNama: string
  jenis: string
  merk: string
  platNomor: string
  tahun: number
}

export default function KendaraanPage() {
  const [pelanggan, setPelanggan] = useState<Pelanggan[]>([])
  const [kendaraan, setKendaraan] = useState<Kendaraan[]>([])
  const [editId, setEditId] = useState<string | null>(null)

  // FILTER & SEARCH
  const [filterJenis, setFilterJenis] = useState('Semua')
  const [search, setSearch] = useState('')

  const [form, setForm] = useState({
    pelangganId: '',
    jenis: 'Motor',
    merk: '',
    platNomor: '',
    tahun: '',
  })

  // ================= FETCH =================
  useEffect(() => {
    const fetchPelanggan = async () => {
      const snap = await getDocs(collection(db, 'pelanggan'))
      setPelanggan(
        snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
      )
    }

    const fetchKendaraan = async () => {
      const snap = await getDocs(collection(db, 'kendaraan'))
      setKendaraan(
        snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
      )
    }

    fetchPelanggan()
    fetchKendaraan()
  }, [])

  const reloadKendaraan = async () => {
    const snap = await getDocs(collection(db, 'kendaraan'))
    setKendaraan(
      snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
    )
  }

  // ================= SUBMIT =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const selectedPelanggan = pelanggan.find(
      p => p.id === form.pelangganId
    )
    if (!selectedPelanggan) return

    if (editId) {
      await updateDoc(doc(db, 'kendaraan', editId), {
        ...form,
        pelangganNama: selectedPelanggan.nama,
        tahun: Number(form.tahun),
      })
      setEditId(null)
    } else {
      await addDoc(collection(db, 'kendaraan'), {
        ...form,
        pelangganNama: selectedPelanggan.nama,
        tahun: Number(form.tahun),
        createdAt: Timestamp.now(),
      })
    }

    setForm({
      pelangganId: '',
      jenis: 'Motor',
      merk: '',
      platNomor: '',
      tahun: '',
    })

    reloadKendaraan()
  }

  const handleEdit = (k: Kendaraan) => {
    setEditId(k.id)
    setForm({
      pelangganId: k.pelangganId,
      jenis: k.jenis,
      merk: k.merk,
      platNomor: k.platNomor,
      tahun: k.tahun.toString(),
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus kendaraan ini?')) return
    await deleteDoc(doc(db, 'kendaraan', id))
    reloadKendaraan()
  }

  // ================= FILTERED DATA =================
  const filteredKendaraan = kendaraan.filter(k => {
    const matchJenis =
      filterJenis === 'Semua' || k.jenis === filterJenis

    const keyword = search.toLowerCase()
    const matchSearch =
      k.pelangganNama.toLowerCase().includes(keyword) ||
      k.merk.toLowerCase().includes(keyword) ||
      k.platNomor.toLowerCase().includes(keyword)

    return matchJenis && matchSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Data Kendaraan</h1>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-8 grid grid-cols-2 gap-4"
      >
        <select
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2"
          value={form.pelangganId}
          onChange={e =>
            setForm({ ...form, pelangganId: e.target.value })
          }
          required
        >
          <option value="">Pilih Pelanggan</option>
          {pelanggan.map(p => (
            <option key={p.id} value={p.id}>
              {p.nama}
            </option>
          ))}
        </select>

        <select
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2"
          value={form.jenis}
          onChange={e =>
            setForm({ ...form, jenis: e.target.value })
          }
        >
          <option>Motor</option>
          <option>Mobil</option>
        </select>

        <input
          placeholder="Merk"
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2"
          value={form.merk}
          onChange={e =>
            setForm({ ...form, merk: e.target.value })
          }
          required
        />

        <input
          placeholder="Plat Nomor"
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2"
          value={form.platNomor}
          onChange={e =>
            setForm({ ...form, platNomor: e.target.value })
          }
          required
        />

        <input
          type="number"
          placeholder="Tahun"
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2"
          value={form.tahun}
          onChange={e =>
            setForm({ ...form, tahun: e.target.value })
          }
          required
        />

        <button className="col-span-2 bg-red-600 hover:bg-red-700 transition rounded py-2 font-semibold">
          {editId ? 'Update Kendaraan' : 'Tambah Kendaraan'}
        </button>
      </form>

      {/* FILTER */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          placeholder="Cari pelanggan / merk / plat..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded px-4 py-2"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          className="bg-gray-800 border border-gray-700 rounded px-4 py-2"
          value={filterJenis}
          onChange={e => setFilterJenis(e.target.value)}
        >
          <option>Semua</option>
          <option>Motor</option>
          <option>Mobil</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-800 text-gray-300 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Pelanggan</th>
                <th className="px-4 py-3">Jenis</th>
                <th className="px-4 py-3">Merk</th>
                <th className="px-4 py-3">Plat</th>
                <th className="px-4 py-3">Tahun</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-700">
              {filteredKendaraan.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Data kendaraan tidak ditemukan
                  </td>
                </tr>
              ) : (
                filteredKendaraan.map(k => (
                  <tr
                    key={k.id}
                    className="hover:bg-gray-800 transition"
                  >
                    <td className="px-4 py-3 font-medium">
                      {k.pelangganNama}
                    </td>
                    <td className="px-4 py-3">{k.jenis}</td>
                    <td className="px-4 py-3">{k.merk}</td>
                    <td className="px-4 py-3 tracking-wider">
                      {k.platNomor}
                    </td>
                    <td className="px-4 py-3">{k.tahun}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleEdit(k)}
                          className="px-3 py-1 rounded bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(k.id)}
                          className="px-3 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20"
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
      </div>
    </div>
  )
}
