'use client'

import { useEffect, useState } from 'react'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface Pelanggan {
  id: string
  nama: string
  noHp: string
  alamat: string
}

export default function PelangganPage() {
  const [data, setData] = useState<Pelanggan[]>([])
  const [nama, setNama] = useState('')
  const [noHp, setNoHp] = useState('')
  const [alamat, setAlamat] = useState('')
  const [editId, setEditId] = useState<string | null>(null)

  const pelangganRef = collection(db, 'pelanggan')

  // READ
  const fetchData = async () => {
    const snapshot = await getDocs(pelangganRef)
    const result = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Pelanggan, 'id'>),
    }))
    setData(result)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // CREATE & UPDATE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editId) {
      await updateDoc(doc(db, 'pelanggan', editId), {
        nama,
        noHp,
        alamat,
      })
      setEditId(null)
    } else {
      await addDoc(pelangganRef, { nama, noHp, alamat })
    }

    setNama('')
    setNoHp('')
    setAlamat('')
    fetchData()
  }

  // DELETE
  const handleDelete = async (id: string) => {
    if (!confirm('Hapus pelanggan ini?')) return
    await deleteDoc(doc(db, 'pelanggan', id))
    fetchData()
  }

  // EDIT
  const handleEdit = (item: Pelanggan) => {
    setEditId(item.id)
    setNama(item.nama)
    setNoHp(item.noHp)
    setAlamat(item.alamat)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      <h1 className="text-2xl font-bold mb-6">
        Data Pelanggan
      </h1>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-8 max-w-xl"
      >
        <h2 className="font-semibold mb-4">
          {editId ? 'Edit Pelanggan' : 'Tambah Pelanggan'}
        </h2>

        <input
          className="w-full mb-3 px-4 py-2 bg-gray-800 border border-gray-700 rounded"
          placeholder="Nama Pelanggan"
          value={nama}
          onChange={e => setNama(e.target.value)}
          required
        />

        <input
          className="w-full mb-3 px-4 py-2 bg-gray-800 border border-gray-700 rounded"
          placeholder="No HP"
          value={noHp}
          onChange={e => setNoHp(e.target.value)}
          required
        />

        <textarea
          className="w-full mb-4 px-4 py-2 bg-gray-800 border border-gray-700 rounded"
          placeholder="Alamat"
          value={alamat}
          onChange={e => setAlamat(e.target.value)}
          required
        />

        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded font-semibold"
        >
          {editId ? 'Update' : 'Simpan'}
        </button>
      </form>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-700 rounded">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-3 text-left">Nama</th>
              <th className="p-3 text-left">No HP</th>
              <th className="p-3 text-left">Alamat</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr
                key={item.id}
                className="border-t border-gray-700 hover:bg-gray-800"
              >
                <td className="p-3">{item.nama}</td>
                <td className="p-3">{item.noHp}</td>
                <td className="p-3">{item.alamat}</td>
                <td className="p-3 text-center space-x-2">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data.length === 0 && (
          <p className="text-center text-gray-400 mt-6">
            Belum ada data pelanggan
          </p>
        )}
      </div>
    </div>
  )
}
