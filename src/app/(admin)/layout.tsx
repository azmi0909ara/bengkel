import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
