'use client'

import { useEffect, useState } from 'react'
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

type Stok = {
  id: string
  nama: string
  kategori: string
  stok: number
  harga: number
}

export default function StokPage() {
  const [data, setData] = useState<Stok[]>([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    nama: '',
    kategori: '',
    stok: '',
    harga: '',
  })
  const [editId, setEditId] = useState<string | null>(null)

  // Fetch data
  const fetchData = async () => {
    const snap = await getDocs(collection(db, 'stok'))
    setData(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      nama: form.nama,
      kategori: form.kategori,
      stok: Number(form.stok),
      harga: Number(form.harga),
    }

    if (editId) {
      await updateDoc(doc(db, 'stok', editId), payload)
      setEditId(null)
    } else {
      await addDoc(collection(db, 'stok'), {
        ...payload,
        createdAt: Timestamp.now(),
      })
    }

    setForm({ nama: '', kategori: '', stok: '', harga: '' })
    fetchData()
  }

  const handleEdit = (item: Stok) => {
    setEditId(item.id)
    setForm({
      nama: item.nama,
      kategori: item.kategori,
      stok: item.stok.toString(),
      harga: item.harga.toString(),
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus barang ini?')) return
    await deleteDoc(doc(db, 'stok', id))
    fetchData()
  }

  // Filter search
  const filteredData = data.filter(item =>
    `${item.nama} ${item.kategori}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Stok Barang</h1>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-8 grid grid-cols-2 gap-4"
      >
        <input
          placeholder="Nama Barang"
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2"
          value={form.nama}
          onChange={e => setForm({ ...form, nama: e.target.value })}
          required
        />
        <input
          placeholder="Kategori"
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2"
          value={form.kategori}
          onChange={e => setForm({ ...form, kategori: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Stok"
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2"
          value={form.stok}
          onChange={e => setForm({ ...form, stok: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Harga"
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2"
          value={form.harga}
          onChange={e => setForm({ ...form, harga: e.target.value })}
          required
        />

        <button className="col-span-2 bg-red-600 hover:bg-red-700 transition rounded py-2 font-semibold">
          {editId ? 'Update Barang' : 'Tambah Barang'}
        </button>
      </form>

      {/* SEARCH */}
      <div className="mb-4">
        <input
          placeholder="Cari nama / kategori barang..."
          className="w-full md:w-1/3 bg-gray-800 border border-gray-700 rounded px-4 py-2"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-800 text-gray-300 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Nama Barang</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3 text-center">Stok</th>
                <th className="px-4 py-3">Harga</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-700">
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Data stok tidak ditemukan
                  </td>
                </tr>
              ) : (
                filteredData.map(item => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-800 transition"
                  >
                    <td className="px-4 py-3 font-medium">
                      {item.nama}
                    </td>
                    <td className="px-4 py-3">
                      {item.kategori}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.stok}
                    </td>
                    <td className="px-4 py-3">
                      Rp {item.harga.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-3 py-1 rounded bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-3 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
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
