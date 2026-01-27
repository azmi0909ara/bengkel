"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

type InvoiceModalProps = {
  open: boolean;
  onClose: () => void;
  service: any;
  pelanggan: any;
  kendaraan: any;
};

export default function InvoiceModal({
  open,
  onClose,
  service,
  pelanggan,
  kendaraan,
}: InvoiceModalProps) {
  const printRef = useRef<HTMLDivElement>(null!);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice-${service?.id}`,
  });

  if (!open || !service) return null;

  const subtotal = service.biayaServis + service.totalSparepart;
  const diskon = service.diskon || 0;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-[100]">
      <div className="bg-white w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-xl shadow-2xl">
        {/* Action Buttons */}
        <div className="bg-gray-800 text-white p-4 flex gap-2 justify-end z-10">
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
          >
            🖨 Print
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 rounded hover:bg-gray-700 transition"
          >
            Tutup
          </button>
        </div>

        {/* Invoice Content */}
        <div ref={printRef} className="p-8 bg-white text-black">
          {/* Header */}
          <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
            <h1 className="text-3xl font-bold mb-1">INVOICE SERVICE</h1>
            <p className="text-sm text-gray-600">
              BENGKEL OTOMOTIF - Jl. Contoh No. 123, Jakarta
            </p>
            <p className="text-sm text-gray-600">
              Telp: 021-12345678 | Email: info@bengkel.com
            </p>
          </div>

          {/* Info Service */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-500 mb-1">Invoice ID</p>
              <p className="font-semibold">{service.id}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Tanggal</p>
              <p className="font-semibold">
                {service.tanggal?.toDate().toLocaleDateString("id-ID")}
              </p>
            </div>
          </div>

          {/* Data Pelanggan & Kendaraan */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="border border-gray-300 rounded p-4">
              <h3 className="font-bold text-sm mb-2 text-gray-700">
                DATA PELANGGAN
              </h3>
              <table className="w-full text-xs">
                <tbody>
                  <tr>
                    <td className="py-1 text-gray-600">Nama</td>
                    <td className="py-1 font-semibold">: {pelanggan?.nama}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-600">No HP</td>
                    <td className="py-1 font-semibold">: {pelanggan?.noHp1}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-600">Alamat</td>
                    <td className="py-1 font-semibold">
                      : {pelanggan?.alamat1}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="border border-gray-300 rounded p-4">
              <h3 className="font-bold text-sm mb-2 text-gray-700">
                DATA KENDARAAN
              </h3>
              <table className="w-full text-xs">
                <tbody>
                  <tr>
                    <td className="py-1 text-gray-600">Nopol</td>
                    <td className="py-1 font-semibold">
                      : {kendaraan?.nomorPolisi}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-600">Merek</td>
                    <td className="py-1 font-semibold">
                      : {kendaraan?.merek} {kendaraan?.tipe}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-600">Warna</td>
                    <td className="py-1 font-semibold">: {kendaraan?.warna}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-600">KM Masuk</td>
                    <td className="py-1 font-semibold">
                      : {service.kmSekarang}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Keluhan */}
          <div className="mb-6">
            <h3 className="font-bold text-sm mb-2 text-gray-700">KELUHAN</h3>
            <p className="text-sm border border-gray-300 rounded p-3 bg-gray-50">
              {service.keluhan || "-"}
            </p>
          </div>

          {/* Tabel Sparepart */}
          <div className="mb-6">
            <h3 className="font-bold text-sm mb-2 text-gray-700">
              SPAREPART YANG DIGUNAKAN
            </h3>
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 p-2 text-left">No</th>
                  <th className="border border-gray-300 p-2 text-left">
                    Nama Sparepart
                  </th>
                  <th className="border border-gray-300 p-2 text-center">
                    Qty
                  </th>
                  <th className="border border-gray-300 p-2 text-right">
                    Harga Satuan
                  </th>
                  <th className="border border-gray-300 p-2 text-right">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {service.sparepart.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="border border-gray-300 p-4 text-center text-gray-500"
                    >
                      Tidak ada sparepart
                    </td>
                  </tr>
                ) : (
                  service.sparepart.map((sp: any, i: number) => (
                    <tr key={sp.id}>
                      <td className="border border-gray-300 p-2">{i + 1}</td>
                      <td className="border border-gray-300 p-2">{sp.nama}</td>
                      <td className="border border-gray-300 p-2 text-center">
                        {sp.qty}
                      </td>
                      <td className="border border-gray-300 p-2 text-right">
                        Rp {sp.harga.toLocaleString("id-ID")}
                      </td>
                      <td className="border border-gray-300 p-2 text-right font-semibold">
                        Rp {(sp.harga * sp.qty).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Tabel Jasa */}
          <div className="mb-6">
            <h3 className="font-bold text-sm mb-2 text-gray-700">
              BIAYA JASA SERVICE
            </h3>
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 p-2 text-left">
                    Keterangan
                  </th>
                  <th className="border border-gray-300 p-2 text-right">
                    Biaya
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2">
                    Jasa Service (Mekanik: {service.mekanikNama})
                  </td>
                  <td className="border border-gray-300 p-2 text-right font-semibold">
                    Rp {service.biayaServis.toLocaleString("id-ID")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="flex justify-end mb-8">
            <div className="w-72 border-2 border-gray-800 rounded">
              <div className="flex justify-between p-3 border-b border-gray-300">
                <span className="font-semibold">Total Sparepart:</span>
                <span>Rp {service.totalSparepart.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between p-3 border-b border-gray-300">
                <span className="font-semibold">Biaya Jasa:</span>
                <span>Rp {service.biayaServis.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between p-3 border-b-2 border-gray-800 bg-gray-50">
                <span className="font-bold">Subtotal:</span>
                <span className="font-bold">
                  Rp {subtotal.toLocaleString("id-ID")}
                </span>
              </div>
              {diskon > 0 && (
                <div className="flex justify-between p-3 border-b border-gray-300 text-red-600">
                  <span className="font-semibold">Diskon:</span>
                  <span className="font-semibold">
                    - Rp {diskon.toLocaleString("id-ID")}
                  </span>
                </div>
              )}
              <div className="flex justify-between p-4 bg-gray-800 text-white rounded-b">
                <span className="font-bold text-lg">TOTAL BAYAR:</span>
                <span className="font-bold text-lg">
                  Rp {service.totalBayar.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>

          {/* Info Pembayaran */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <p className="text-xs text-gray-500 mb-1">Jenis Pembayaran</p>
              <p className="font-semibold text-sm">{service.jenisPembayaran}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <p className="font-semibold text-sm">
                {service.status === "SELESAI" ? "✅ LUNAS" : "⏳ MENUNGGU"}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-gray-800 pt-6 mt-8">
            <div className="grid grid-cols-3 gap-4 text-center text-xs">
              <div>
                <p className="mb-12">Mekanik</p>
                <p className="font-semibold border-t border-gray-400 pt-1 inline-block px-4">
                  {service.mekanikNama}
                </p>
              </div>
              <div>
                <p className="mb-12">Pelanggan</p>
                <p className="font-semibold border-t border-gray-400 pt-1 inline-block px-4">
                  {pelanggan?.nama}
                </p>
              </div>
              <div>
                <p className="mb-12">Manager</p>
                <p className="font-semibold border-t border-gray-400 pt-1 inline-block px-4">
                  ( ...................... )
                </p>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>Terima kasih atas kepercayaan Anda</p>
            <p>Barang yang sudah dibeli tidak dapat dikembalikan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
