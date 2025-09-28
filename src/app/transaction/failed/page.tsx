"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function TransactionFailedPage() {
    const searchParams = useSearchParams();
    const userId = searchParams.get("userId");

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
            <div className="bg-red-900/40 border border-red-700 rounded-2xl p-8 shadow-lg max-w-md text-center">
                <h1 className="text-3xl font-bold text-red-400 mb-4">⚠️ Transaksi Gagal</h1>
                <p className="text-gray-300 mb-6">
                    Maaf, pembayaran tidak dapat diproses. Silakan coba lagi.
                </p>

                {userId && (
                    <Link
                        href={`/donate/${userId}`}
                        className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-lg font-semibold block mt-4"
                    >
                        Coba Donasi Lagi
                    </Link>
                )}
            </div>
        </div>
    );
}
