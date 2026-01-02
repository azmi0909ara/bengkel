"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const idToken = await userCredential.user.getIdToken();

      await fetch("/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      router.push("/dashboard");
    } catch (err) {
      setError("Email atau password salah");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-8">
        {/* LOGO / TITLE */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-wide">
            AWANS<span className="text-red-500">SERVICE</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">Admin Management System</p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm p-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm">Email</label>
            <input
              type="email"
              className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm">Password</label>
            <input
              type="password"
              className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-red-600 hover:bg-red-700 transition text-white font-semibold py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "Masuk..." : "Masuk Admin"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-xs mt-6">
          © 2025 AwansService System
        </p>
      </div>
    </div>
  );
}
