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
  if (!open || !service) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-[999]">
      <div className="bg-white text-black w-full max-w-2xl rounded-lg p-6 max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between mb-4">
  {/* Logo kiri */}
  <div className="flex items-center gap-2">
    <img
      src="/awans.png"
      alt="Logo"
      className="w-20 h-20 object-contain"
    />
  </div>

  {/* Judul tengah */}
  <div className="flex-1 text-center">
    <h1 className="text-xl font-bold">INVOICE SERVICE</h1>
    <p className="text-sm">Awans Service</p>
  </div>

  {/* Spacer kanan biar judul tetap center */}
  <div className="w-12" />
</div>
        

        {/* ================= HEADER ================= */}
        <div className="mb-4 text-sm">
          <p><b>Tanggal:</b> {service.tanggal?.toDate().toLocaleDateString('id-ID')}</p>
          <p><b>Status:</b> {service.status}</p>
        </div>

        {/* ================= PELANGGAN ================= */}
        <h2 className="font-semibold mt-4">Data Pelanggan</h2>
        <table className="w-full text-sm border mb-4">
          <tbody>
            <tr><td className="border p-1">Nama</td><td className="border p-1">{pelanggan?.nama}</td></tr>
            <tr><td className="border p-1">No HP</td><td className="border p-1">{pelanggan?.noHp1}</td></tr>
            <tr><td className="border p-1">Alamat</td><td className="border p-1">{pelanggan?.alamat1}</td></tr>
          </tbody>
        </table>

        {/* ================= KENDARAAN ================= */}
        <h2 className="font-semibold">Data Kendaraan</h2>
        <table className="w-full text-sm border mb-4">
          <tbody>
            <tr><td className="border p-1">Polisi</td><td className="border p-1">{kendaraan?.nomorPolisi}</td></tr>
            <tr><td className="border p-1">Merek</td><td className="border p-1">{kendaraan?.merek}</td></tr>
            <tr><td className="border p-1">Tipe</td><td className="border p-1">{kendaraan?.tipe}</td></tr>
            <tr><td className="border p-1">KM</td><td className="border p-1">{service.kmSekarang}</td></tr>
          </tbody>
        </table>

        {/* ================= SPAREPART ================= */}
        <h2 className="font-semibold">Sparepart & Service</h2>
        <table className="w-full text-sm border mb-4">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-1">Nama</th>
              <th className="border p-1">Qty</th>
              <th className="border p-1">Subtotal</th>
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
            </tbody>
        </table>
        <h2 className="font-semibold mb-1">Layanan / Jasa</h2>
        <table className="w-full text-sm border mb-4">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2 text-left">Layanan</th>
              <th className="border p-2 text-right w-32">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">Jasa Service</td>
              <td className="border p-2 text-right">
                Rp {service.biayaServis.toLocaleString('id-ID')}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ================= TOTAL ================= */}
        <div className="text-right font-bold text-lg">
          Total: Rp {service.totalBayar.toLocaleString('id-ID')}
        </div>

        {/* ================= ACTION ================= */}
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
