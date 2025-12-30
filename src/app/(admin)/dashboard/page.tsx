'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'

type Stok = {
  id: string
  nama: string
  stok: number
}

type Service = {
  id: string
  totalBayar: number
  status: string
  jenisServis: string[]
}

export default function Dashboard() {
  const [stok, setStok] = useState<Stok[]>([])
  const [service, setService] = useState<Service[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const stokSnap = await getDocs(collection(db, 'stok'))
      setStok(stokSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })))

      const serviceSnap = await getDocs(collection(db, 'service'))
      setService(
        serviceSnap.docs.map(d => ({
          id: d.id,
          totalBayar: Number(d.data().totalBayar || 0),
          status: d.data().status || 'MENUNGGU',
          jenisServis: Array.isArray(d.data().jenisServis)
            ? d.data().jenisServis
            : []
        }))
      )
    }
    fetchData()
  }, [])

  const totalPendapatan = service.reduce((sum, s) => sum + s.totalBayar, 0)
  const totalService = service.length
  const selesaiCount = service.filter(s => s.status === 'SELESAI').length
  const menungguCount = service.filter(s => s.status === 'MENUNGGU').length
  const barangHabis = stok.filter(s => s.stok === 0).length
  const barangTersedia = stok.filter(s => s.stok > 0).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 text-white space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
          <p className="text-sm text-gray-400">Total Service</p>
          <p className="text-2xl font-bold">{totalService}</p>
          <p className="text-green-400">Selesai: {selesaiCount}</p>
          <p className="text-yellow-400">Menunggu: {menungguCount}</p>
        </div>

        <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
          <p className="text-sm text-gray-400">Stok Barang</p>
          <p className="text-2xl font-bold">{stok.length}</p>
          <p className="text-red-400">Habis: {barangHabis}</p>
          <p className="text-green-400">Tersedia: {barangTersedia}</p>
        </div>

        <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
          <p className="text-sm text-gray-400">Total Pendapatan</p>
          <p className="text-2xl font-bold text-red-500">
            Rp {totalPendapatan.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Latest Services Table */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-gray-300 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">ID Service</th>
                <th className="px-4 py-3">Jenis Servis</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total Bayar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {service.map(s => (
                <tr key={s.id} className="hover:bg-gray-800 transition">
                  <td className="px-4 py-3">{s.id}</td>
                  <td className="px-4 py-3">{s.jenisServis.join(', ')}</td>
                  <td className="px-4 py-3">{s.status}</td>
                  <td className="px-4 py-3">
                    Rp {s.totalBayar.toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
