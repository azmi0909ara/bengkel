"use client";

import Image from "next/image";
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-800">
        {/* Header Modal */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 flex justify-between items-center z-10">
          <h3 className="text-xl font-semibold text-white">Invoice Service</h3>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Print Invoice
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-6">
          <div
            ref={printRef}
            className="bg-white text-black p-8 w-[210mm] max-w-full mx-auto shadow-xl rounded-lg"
          >
            {/* Header / Kop Surat */}
            <div className="border-b-4 border-blue-600 pb-4 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-blue-600 mb-1">
                    AWANS Service
                  </h1>
                  <p className="text-xs text-gray-600 leading-relaxed max-w-md">
                    Jl. Lkr. Dramaga, RT.03/RW.04, Kp. Manggis, Kec. Dramaga,
                    Kab. Bogor, Jawa Barat, 16680
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Telp: 021-12345678 | Email: info@bengkel.com
                  </p>
                </div>
                <div>
                  <Image
                    src="/awans.png"
                    width={64}
                    height={64}
                    alt="logo"
                    className="h-16 w-auto"
                  />
                </div>
              </div>
            </div>

            {/* Judul Dokumen */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
                Invoice Service
              </h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto mt-2"></div>
            </div>

            {/* Info Invoice */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Invoice ID</p>
                <p className="font-semibold text-sm">{service.id}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-right">
                <p className="text-xs text-gray-500 mb-1">Tanggal</p>
                <p className="font-semibold text-sm">
                  {service.tanggal?.toDate().toLocaleDateString("id-ID")}
                </p>
              </div>
            </div>

            {/* Info Grid - Pelanggan & Kendaraan */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Data Pelanggan */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide border-b border-gray-300 pb-2">
                  <span className="text-blue-600">👥</span> Data Pelanggan
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="text-gray-600 w-20 font-medium">Nama</span>
                    <span className="text-gray-800 font-semibold">
                      : {pelanggan?.nama}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-20 font-medium">
                      No HP
                    </span>
                    <span className="text-gray-800">: {pelanggan?.noHp1}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-20 font-medium">
                      Alamat
                    </span>
                    <span className="text-gray-800">
                      : {pelanggan?.alamat1}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Kendaraan */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide border-b border-gray-300 pb-2">
                  <span className="text-blue-600">🚘</span> Data Kendaraan
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="text-gray-600 w-20 font-medium">
                      Nopol
                    </span>
                    <span className="text-gray-800 font-semibold">
                      : {kendaraan?.nomorPolisi}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-20 font-medium">
                      Merek
                    </span>
                    <span className="text-gray-800">
                      : {kendaraan?.merek} {kendaraan?.tipe}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-20 font-medium">
                      Warna
                    </span>
                    <span className="text-gray-800">: {kendaraan?.warna}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-20 font-medium">
                      KM Masuk
                    </span>
                    <span className="text-gray-800">
                      : {service.kmSekarang}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Keluhan */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide border-b border-blue-300 pb-2">
                <span className="text-blue-600">🛠</span> Keluhan
              </h3>
              <p className="text-sm text-gray-800 bg-white p-3 rounded border border-gray-200">
                {service.keluhan || "-"}
              </p>
            </div>

            {/* Tabel Sparepart */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">
                Sparepart Yang Digunakan
              </h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="border border-blue-700 px-4 py-3 text-left text-sm font-semibold w-12">
                      No
                    </th>
                    <th className="border border-blue-700 px-4 py-3 text-left text-sm font-semibold">
                      Nama Sparepart
                    </th>
                    <th className="border border-blue-700 px-4 py-3 text-center text-sm font-semibold w-20">
                      Qty
                    </th>
                    <th className="border border-blue-700 px-4 py-3 text-right text-sm font-semibold w-32">
                      Harga Satuan
                    </th>
                    <th className="border border-blue-700 px-4 py-3 text-right text-sm font-semibold w-32">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {service.sparepart.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="border border-gray-300 p-4 text-center text-gray-500 bg-gray-50"
                      >
                        Tidak ada sparepart yang digunakan
                      </td>
                    </tr>
                  ) : (
                    service.sparepart.map((sp: any, i: number) => (
                      <tr
                        key={sp.id}
                        className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
                      >
                        <td className="border border-gray-300 px-4 py-2 text-sm text-center">
                          {i + 1}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">
                          {sp.nama}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center text-sm font-medium">
                          {sp.qty}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right text-sm">
                          Rp {sp.harga.toLocaleString("id-ID")}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">
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
              <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">
                Biaya Jasa Service
              </h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="border border-blue-700 px-4 py-3 text-left text-sm font-semibold">
                      Keterangan
                    </th>
                    <th className="border border-blue-700 px-4 py-3 text-right text-sm font-semibold w-32">
                      Biaya
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-sm">
                      Jasa Service (Mekanik: {service.mekanik})
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">
                      Rp {service.biayaServis.toLocaleString("id-ID")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Summary Biaya */}
            <div className="border-t-2 border-gray-300 pt-4">
              <div className="flex justify-end">
                <div className="w-80">
                  <div className="space-y-2 text-sm mb-3">
                    <div className="flex justify-between py-1 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">
                        Total Sparepart
                      </span>
                      <span className="text-gray-800 font-semibold">
                        Rp {service.totalSparepart.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">
                        Biaya Jasa Service
                      </span>
                      <span className="text-gray-800 font-semibold">
                        Rp {service.biayaServis.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b-2 border-gray-400 bg-gray-50 px-2">
                      <span className="text-gray-800 font-bold">Subtotal</span>
                      <span className="text-gray-800 font-bold">
                        Rp {subtotal.toLocaleString("id-ID")}
                      </span>
                    </div>
                    {diskon > 0 && (
                      <div className="flex justify-between py-1 border-b border-gray-200">
                        <span className="text-gray-600 font-medium">
                          Diskon
                        </span>
                        <span className="text-red-600 font-semibold">
                          - Rp {diskon.toLocaleString("id-ID")}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="bg-blue-600 text-white p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-base uppercase tracking-wide">
                        Total Bayar
                      </span>
                      <span className="font-bold text-xl">
                        Rp {service.totalBayar.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Pembayaran */}
            <div className="grid grid-cols-2 gap-6 mt-6 mb-8">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Jenis Pembayaran</p>
                <p className="font-semibold text-sm">
                  {service.jenisPembayaran}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Status Pembayaran</p>
                <p className="font-semibold text-sm">
                  {service.status === "SELESAI" ? (
                    <span className="text-green-600">✅ LUNAS</span>
                  ) : (
                    <span className="text-orange-600">⏳ MENUNGGU</span>
                  )}
                </p>
              </div>
            </div>

            {/* Tanda Tangan */}
            <div className="border-t-2 border-gray-300 pt-6 mt-8">
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <p className="mb-16 text-gray-600">Mekanik</p>
                  <div className="border-t border-gray-400 pt-2 inline-block px-8">
                    <p className="font-semibold">{service.mekanik}</p>
                  </div>
                </div>
                <div>
                  <p className="mb-16 text-gray-600">Pelanggan</p>
                  <div className="border-t border-gray-400 pt-2 inline-block px-8">
                    <p className="font-semibold">{pelanggan?.nama}</p>
                  </div>
                </div>
                <div>
                  <p className="mb-16 text-gray-600">Manager</p>
                  <div className="border-t border-gray-400 pt-2 inline-block px-8">
                    <p className="font-semibold text-gray-400">
                      ( ...................... )
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-gray-300">
              <p className="text-xs text-gray-500 text-center mb-1">
                Terima kasih atas kepercayaan Anda
              </p>
              <p className="text-xs text-gray-500 text-center">
                Barang yang sudah dibeli tidak dapat dikembalikan
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
