'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { jsPDF as JsPDFType } from 'jspdf'

type SparepartDipakai = {
  nama: string
  harga: number
  qty: number
}

type Service = {
  id: string
  pelangganNama: string
  kendaraanLabel: string
  mekanikNama: string
  jenisServis: string[]
  sparepart: SparepartDipakai[]
  biayaServis: number
  totalSparepart: number
  totalBayar: number
  status: string
}

export default function InvoicePage() {
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  const [jspdfLoaded, setJspdfLoaded] = useState<{
    jsPDF: any
    autoTable: any
  } | null>(null)

  // import jsPDF + autotable hanya di browser
  useEffect(() => {
    if (typeof window !== 'undefined') {
      Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ]).then(([jspdfModule, autotableModule]) => {
        setJspdfLoaded({
          jsPDF: jspdfModule.jsPDF,
          autoTable: autotableModule.default || autotableModule
        })
      })
    }
  }, [])

  useEffect(() => {
    const fetchService = async () => {
      const snap = await getDocs(collection(db, 'service'))
      const data: Service[] = snap.docs.map(d => {
        const docData = d.data() as any
        return {
          id: d.id,
          pelangganNama: docData.pelangganNama || '',
          kendaraanLabel: docData.kendaraanLabel || '',
          mekanikNama: docData.mekanikNama || '',
          jenisServis: Array.isArray(docData.jenisServis)
            ? docData.jenisServis
            : typeof docData.jenisServis === 'string'
            ? [docData.jenisServis]
            : [],
          sparepart: Array.isArray(docData.sparepart) ? docData.sparepart : [],
          biayaServis: Number(docData.biayaServis || 0),
          totalSparepart: Number(docData.totalSparepart || 0),
          totalBayar: Number(docData.totalBayar || 0),
          status: docData.status || '',
        }
      })
      setServices(data)
      if (data.length > 0) setSelectedService(data[0])
    }
    fetchService()
  }, [])

  const markAsDone = async () => {
    if (!selectedService) return
    const ref = doc(db, 'service', selectedService.id)
    await updateDoc(ref, { status: 'SELESAI' })
    setSelectedService({ ...selectedService, status: 'SELESAI' })
    setServices(prev =>
      prev.map(s => (s.id === selectedService.id ? { ...s, status: 'SELESAI' } : s))
    )
    alert('Status service diperbarui menjadi SELESAI')
  }

  const printPDF = () => {
    if (!selectedService || !jspdfLoaded) return

    const { jsPDF, autoTable } = jspdfLoaded
    const doc = new jsPDF('p', 'mm', 'a4')

    const margin = 20
    let y = 20

    doc.setFontSize(18)
    doc.text('INVOICE SERVICE', 105, y, { align: 'center' })
    y += 10

    doc.setFontSize(12)
    doc.text(`Pelanggan: ${selectedService.pelangganNama}`, margin, y)
    y += 7
    doc.text(`Kendaraan: ${selectedService.kendaraanLabel}`, margin, y)
    y += 7
    doc.text(`Mekanik: ${selectedService.mekanikNama}`, margin, y)
    y += 7
    doc.text(`Jenis Servis: ${selectedService.jenisServis.join(', ')}`, margin, y)
    y += 7
    doc.text(`Status: ${selectedService.status}`, margin, y)
    y += 10

    // table sparepart
    if (selectedService.sparepart.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [['Nama', 'Harga', 'Qty', 'Subtotal']],
        body: selectedService.sparepart.map(s => [
          s.nama,
          `Rp ${s.harga.toLocaleString('id-ID')}`,
          s.qty,
          `Rp ${(s.harga * s.qty).toLocaleString('id-ID')}`
        ]),
        theme: 'grid',
        headStyles: { fillColor: [30, 30, 30], textColor: [255, 255, 255] },
        margin: { left: margin, right: margin }
      })
      y = (doc as any).lastAutoTable.finalY + 10
    }

    doc.setFontSize(12)
    doc.text(`Biaya Servis: Rp ${selectedService.biayaServis.toLocaleString('id-ID')}`, margin, y)
    y += 7
    doc.text(`Total Sparepart: Rp ${selectedService.totalSparepart.toLocaleString('id-ID')}`, margin, y)
    y += 10
    doc.setFontSize(14)
    doc.text(`Total Bayar: Rp ${selectedService.totalBayar.toLocaleString('id-ID')}`, margin, y)

    doc.save(`invoice-${selectedService.id}.pdf`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Invoice Service</h1>

      <select
        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 mb-6"
        value={selectedService?.id || ''}
        onChange={e => {
          const service = services.find(s => s.id === e.target.value)
          setSelectedService(service || null)
        }}
      >
        {services.map(s => (
          <option key={s.id} value={s.id}>
            {s.pelangganNama} - {s.kendaraanLabel} [{s.status}]
          </option>
        ))}
      </select>

      {selectedService && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-4">
          <p><strong>Pelanggan:</strong> {selectedService.pelangganNama}</p>
          <p><strong>Kendaraan:</strong> {selectedService.kendaraanLabel}</p>
          <p><strong>Mekanik:</strong> {selectedService.mekanikNama}</p>
          <p><strong>Jenis Servis:</strong> {selectedService.jenisServis.join(', ')}</p>
          <p><strong>Status:</strong> {selectedService.status}</p>

          <div>
            <p className="font-semibold mb-2">Sparepart Digunakan:</p>
            {selectedService.sparepart.length === 0 ? (
              <p className="text-gray-400">Tidak ada sparepart</p>
            ) : (
              <table className="w-full text-sm text-left border border-gray-700 rounded">
                <thead className="bg-gray-800 text-gray-300 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-2">Nama</th>
                    <th className="px-4 py-2">Harga</th>
                    <th className="px-4 py-2">Qty</th>
                    <th className="px-4 py-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {selectedService.sparepart.map((s, i) => (
                    <tr key={i} className="hover:bg-gray-800 transition">
                      <td className="px-4 py-2">{s.nama}</td>
                      <td className="px-4 py-2">Rp {s.harga.toLocaleString('id-ID')}</td>
                      <td className="px-4 py-2">{s.qty}</td>
                      <td className="px-4 py-2">Rp {(s.harga * s.qty).toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="bg-black/40 border border-gray-700 rounded p-4 text-sm">
            <p>Biaya Servis: Rp {selectedService.biayaServis.toLocaleString('id-ID')}</p>
            <p>Total Sparepart: Rp {selectedService.totalSparepart.toLocaleString('id-ID')}</p>
            <p className="text-lg font-bold text-red-500">
              Total Bayar: Rp {selectedService.totalBayar.toLocaleString('id-ID')}
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <button
              className="w-full bg-green-600 hover:bg-green-700 transition rounded py-2 font-semibold"
              onClick={markAsDone}
            >
              Tandai Selesai
            </button>
            <button
              className="w-full bg-red-600 hover:bg-red-700 transition rounded py-2 font-semibold"
              onClick={printPDF}
            >
              Cetak PDF
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
