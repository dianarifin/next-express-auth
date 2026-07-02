"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export function VerifyEmail() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Memverifikasi email Anda...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token verifikasi tidak ditemukan");
    }

    fetch(`${BACKEND}/auth/verify-email?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.emailVerified) {
          setStatus("success");
          setMessage(
            "Email berhasil diverfikasi! Anda dapat menutup halaman ini.",
          );
        } else {
          setStatus("error");
          setMessage(data.error || "Verifikasi gagal.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Terjadi kesalahan. Silakan coba lagi.");
      });
  }, [token]);

  return (
    <div className="text-center">
      {status === "loading" && <p>{message}</p>}
      {status === "success" && (
        <div>
          <h1 className="text-2xl font-bold text-green-600">✓ Berhasil!</h1>
          <p className="mt-2">{message}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 rounded-none bg-black px-6 py-2 text-white"
          >
            Ke Dashboard
          </button>
        </div>
      )}
      {status === "error" && (
        <div>
          <h1 className="text-2xl font-bold text-red-600">Gagal</h1>
          <p className="mt-2">{message}</p>
        </div>
      )}
    </div>
  );
}
