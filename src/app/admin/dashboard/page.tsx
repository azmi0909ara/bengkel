export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        Dashboard Bengkel 🛠️
      </h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          Total Pelanggan
          <p className="text-2xl font-bold">12</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          Total Kendaraan
          <p className="text-2xl font-bold">20</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          Servis Hari Ini
          <p className="text-2xl font-bold">5</p>
        </div>
      </div>
    </div>
  )
}
