"use client";

import { Estimasi } from "@/types/service";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

type EstimasiPrintProps = {
  service: Estimasi;
};

export default function EstimasiPrint({ service }: EstimasiPrintProps) {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Estimasi_${service.pelangganNama}`,
  });

  return (
    <div className="mb-6">
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
        Print Estimasi
      </button>

      {/* ================== PRINT AREA ================== */}
      <div
        ref={componentRef}
        className="bg-white text-black p-8 w-[210mm] max-w-full mx-auto shadow-xl rounded-lg mt-4"
      >
        {/* Header / Kop Surat */}
        <div className="border-b-4 border-blue-600 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-blue-600 mb-1">
                AWANS Service
              </h1>
              <p className="text-xs text-gray-600 leading-relaxed max-w-md">
                Jl. Lkr. Dramaga, RT.03/RW.04, Kp. Manggis, Kec. Dramaga, Kab.
                Bogor, Jawa Barat, 16680
              </p>
            </div>
            <div>
              <img src="/awans.png" alt="Logo" className="h-16" />
            </div>
          </div>
        </div>

        {/* Judul Dokumen */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
            Estimasi Biaya Service
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mt-2"></div>
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
                <span className="text-gray-600 w-24 font-medium">Nama</span>
                <span className="text-gray-800 font-semibold">
                  : {service.pelangganNama}
                </span>
              </div>
              <div className="flex">
                <span className="text-gray-600 w-24 font-medium">
                  ID Pelanggan
                </span>
                <span className="text-gray-800">: {service.pelangganId}</span>
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
                <span className="text-gray-600 w-24 font-medium">
                  Kendaraan
                </span>
                <span className="text-gray-800 font-semibold">
                  : {service.kendaraanLabel}
                </span>
              </div>
              <div className="flex">
                <span className="text-gray-600 w-24 font-medium">
                  ID Kendaraan
                </span>
                <span className="text-gray-800">: {service.kendaraanId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Estimasi */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide border-b border-blue-300 pb-2">
            <span className="text-blue-600">🛠</span> Detail Estimasi
          </h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div className="flex">
              <span className="text-gray-600 w-32 font-medium">Tanggal</span>
              <span className="text-gray-800 font-semibold">
                : {service.tanggal?.toDate().toLocaleDateString("id-ID")}
              </span>
            </div>
            <div className="flex">
              <span className="text-gray-600 w-32 font-medium">Pembayaran</span>
              <span className="text-gray-800 font-semibold">
                : {service.jenisPembayaran}
              </span>
            </div>
            <div className="col-span-2 mt-2">
              <span className="text-gray-600 font-medium block mb-1">
                Keluhan
              </span>
              <p className="text-gray-800 bg-white p-3 rounded border border-gray-200">
                {service.keluhan}
              </p>
            </div>
          </div>
        </div>

        {/* Tabel Sparepart */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">
            Daftar Sparepart
          </h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white">
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
              {service.sparepart.map((sp, index) => (
                <tr
                  key={sp.id}
                  className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
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
              ))}
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
                    Biaya Jasa Service
                  </span>
                  <span className="text-gray-800 font-semibold">
                    Rp {service.biayaServis.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">
                    Total Sparepart
                  </span>
                  <span className="text-gray-800 font-semibold">
                    Rp {service.totalSparepart.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Diskon</span>
                  <span className="text-red-600 font-semibold">
                    - Rp {service.diskon.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
              <div className="bg-blue-600 text-white p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-base uppercase tracking-wide">
                    Total Estimasi
                  </span>
                  <span className="font-bold text-xl">
                    Rp {service.totalBayar.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-300">
          <p className="text-xs text-gray-500 text-center">
            Dokumen ini adalah estimasi biaya. Biaya aktual dapat berbeda sesuai
            kondisi lapangan.
          </p>
        </div>
      </div>
    </div>
  );
}
