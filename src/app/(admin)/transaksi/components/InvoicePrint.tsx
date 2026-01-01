'use client'

type Props = {
  open: boolean
  onClose: () => void
  service: any
  pelanggan: any
  kendaraan: any
}

export default function InvoiceModal({
  open,
  onClose,
  service,
  pelanggan,
  kendaraan,
}: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div className="bg-white text-black w-full max-w-2xl p-6 rounded-xl print:bg-white">
        {/* HEADER */}
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold">INVOICE SERVICE</h1>
          <p className="text-sm">Awans Service</p>
        </div>

        {/* INFO */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <p><b>Pelanggan</b></p>
            <p>{pelanggan?.nama}</p>
            <p>{pelanggan?.noHp1}</p>
          </div>
          <div>
            <p><b>Kendaraan</b></p>
            <p>{kendaraan?.nomorPolisi}</p>
            <p>{kendaraan?.merek} {kendaraan?.tipe}</p>
          </div>
        </div>

        {/* SERVICE */}
        <table className="w-full text-sm border mb-4">
          <thead>
            <tr className="border">
              <th className="p-2 text-left">Item</th>
              <th className="p-2 text-center">Qty</th>
              <th className="p-2 text-right">Harga</th>
            </tr>
          </thead>
          <tbody>
            {service.sparepart.map((sp: any) => (
              <tr key={sp.id} className="border">
                <td className="p-2">{sp.nama}</td>
                <td className="p-2 text-center">{sp.qty}</td>
                <td className="p-2 text-right">
                  Rp {(sp.harga * sp.qty).toLocaleString('id-ID')}
                </td>
              </tr>
            ))}
            <tr className="border">
              <td className="p-2">Jasa Service</td>
              <td className="p-2 text-center">1</td>
              <td className="p-2 text-right">
                Rp {service.biayaServis.toLocaleString('id-ID')}
              </td>
            </tr>
          </tbody>
        </table>

        <p className="text-right font-bold mb-4">
          Total: Rp {service.totalBayar.toLocaleString('id-ID')}
        </p>

        {/* ACTION */}
        <div className="flex gap-2 print:hidden">
          <button
            onClick={() => window.print()}
            className="w-1/2 bg-green-600 text-white py-2 rounded"
          >
            Print
          </button>
          <button
            onClick={onClose}
            className="w-1/2 bg-gray-700 text-white py-2 rounded"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
