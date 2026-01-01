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
  keterangan: string
}

export default function PelangganPage() {
  const [data, setData] = useState<Pelanggan[]>([])
  const [editId, setEditId] = useState<string | null>(null)

  // 🔍 search & filter
  const [search, setSearch] = useState('')
  const [filterGender, setFilterGender] = useState('')

  // 👁 modal detail
  const [detail, setDetail] = useState<Pelanggan | null>(null)

  const [form, setForm] = useState<Omit<Pelanggan, 'id'>>({
    nama: '',
    noHp1: '',
    noHp2: '',
    nik: '',
    birthdate: '',
    gender: '',
    email: '',
    alamat1: '',
    kodePos: '',
    ibuKota: '',
    alamat2: '',
    keterangan: '',
  })

  const pelangganRef = collection(db, 'pelanggan')

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const resetForm = () => {
    setEditId(null)
    setForm({
      nama: '',
      noHp1: '',
      noHp2: '',
      nik: '',
      birthdate: '',
      gender: '',
      email: '',
      alamat1: '',
      kodePos: '',
      ibuKota: '',
      alamat2: '',
      keterangan: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editId) {
      await updateDoc(doc(db, 'pelanggan', editId), form)
    } else {
      await addDoc(pelangganRef, form)
    }
    resetForm()
    fetchData()
  }

  const handleEdit = (item: Pelanggan) => {
    setEditId(item.id)
    const { id, ...rest } = item
    setForm(rest)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus pelanggan ini?')) return
    await deleteDoc(doc(db, 'pelanggan', id))
    fetchData()
  }

  // 🔍 FILTERED DATA
  const filteredData = data.filter(p => {
    const keyword = search.toLowerCase()
    const matchSearch =
      p.nama.toLowerCase().includes(keyword) ||
      p.noHp1.includes(keyword) ||
      p.noHp2.includes(keyword) ||
      p.nik.includes(keyword) ||
      p.email.toLowerCase().includes(keyword)

    const matchGender = filterGender ? p.gender === filterGender : true

    return matchSearch && matchGender
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Data Pelanggan</h1>

      {/* ================= FORM (TIDAK DIUBAH) ================= */}
      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-10">
        <h2 className="font-semibold mb-4">
          {editId ? 'Edit Pelanggan' : 'Tambah Pelanggan'}
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <input name="nama" placeholder="Nama Customer" value={form.nama} onChange={handleChange} className="input" required />
          <input name="nik" placeholder="No KTP (WNI)" value={form.nik} onChange={handleChange} className="input" />

          <input name="noHp1" placeholder="No HP 1" value={form.noHp1} onChange={handleChange} className="input" required />
          <input name="noHp2" placeholder="No HP 2" value={form.noHp2} onChange={handleChange} className="input" />

          <input type="date" name="birthdate" value={form.birthdate} onChange={handleChange} className="input" />
          <select name="gender" value={form.gender} onChange={handleChange} className="input">
            <option value="">Pilih Gender</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>

          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="input" />
          <input name="kodePos" placeholder="Kode Pos" value={form.kodePos} onChange={handleChange} className="input" />

          <input name="ibuKota" placeholder="Ibu Kota" value={form.ibuKota} onChange={handleChange} className="input" />
        </div>

        <textarea name="alamat1" placeholder="Alamat 1" value={form.alamat1} onChange={handleChange} className="input mt-4" />
        <textarea name="alamat2" placeholder="Alamat 2" value={form.alamat2} onChange={handleChange} className="input mt-4" />
        <textarea name="keterangan" placeholder="Keterangan" value={form.keterangan} onChange={handleChange} className="input mt-3" />

        <div className="mt-4 flex gap-3">
          <button className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded font-semibold">
            {editId ? 'Update' : 'Simpan'}
          </button>
          {editId && (
            <button type="button" onClick={resetForm} className="border border-gray-600 px-6 py-2 rounded">
              Batal
            </button>
          )}
        </div>
      </form>

      {/* ================= SEARCH & FILTER ================= */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          placeholder="Cari nama / HP / NIK / email"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-gray-800 border border-gray-700 px-4 py-2 rounded w-full md:w-1/3"
        />

        <select
          value={filterGender}
          onChange={e => setFilterGender(e.target.value)}
          className="bg-gray-800 border border-gray-700 px-4 py-2 rounded"
        >
          <option value="">Semua Gender</option>
          <option value="Laki-laki">Laki-laki</option>
          <option value="Perempuan">Perempuan</option>
        </select>
      </div>

      {/* ================= TABLE ================= */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-700 rounded">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-3 text-left">Nama</th>
              <th className="p-3 text-left">HP</th>
              <th className="p-3 text-left">Gender</th>
              <th className="p-3 text-left">Kota</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(item => (
              <tr key={item.id} className="border-t border-gray-700 hover:bg-gray-800">
                <td className="p-3 font-medium">{item.nama}</td>
                <td className="p-3">
                  {item.noHp1}
                  {item.noHp2 && <div className="text-sm text-gray-400">{item.noHp2}</div>}
                </td>
                <td className="p-3">{item.gender || '-'}</td>
                <td className="p-3">{item.ibuKota}</td>
                <td className="p-3">{item.email || '-'}</td>
                <td className="p-3 text-center space-x-2">
                  <button onClick={() => setDetail(item)} className="btn-view">
                    Detail
                  </button>
                  <button onClick={() => handleEdit(item)} className="btn-edit">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="btn-delete">
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredData.length === 0 && (
          <p className="text-center text-gray-400 mt-6">Data tidak ditemukan</p>
        )}
      </div>

      {/* ================= MODAL DETAIL ================= */}
      {detail && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">Detail Pelanggan</h2>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <p><b>Nama:</b> {detail.nama}</p>
              <p><b>NIK:</b> {detail.nik}</p>
              <p><b>HP 1:</b> {detail.noHp1}</p>
              <p><b>HP 2:</b> {detail.noHp2}</p>
              <p><b>Gender:</b> {detail.gender}</p>
              <p><b>Birthdate:</b> {detail.birthdate}</p>
              <p><b>Email:</b> {detail.email}</p>
              <p><b>Kode Pos:</b> {detail.kodePos}</p>
              <p><b>Kota:</b> {detail.ibuKota}</p>
              <p className="col-span-2"><b>Alamat 1:</b> {detail.alamat1}</p>
              <p className="col-span-2"><b>Alamat 2:</b> {detail.alamat2}</p>
              <p className="col-span-2"><b>Keterangan:</b> {detail.keterangan}</p>
            </div>

            <div className="text-right mt-6">
              <button onClick={() => setDetail(null)} className="bg-red-600 mt-6 w-full border border-gray-600 py-2 rounded hover:bg-gray-800">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
