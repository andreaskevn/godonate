"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function TransactionSuccessPage() {
    const searchParams = useSearchParams();
    const userId = searchParams.get("userId");

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
            <div className="bg-green-900/40 border border-green-700 rounded-2xl p-8 shadow-lg max-w-md text-center">
                <h1 className="text-3xl font-bold text-green-400 mb-4">🎉 Transaksi Berhasil</h1>
                <p className="text-gray-300 mb-6">
                    Terima kasih atas donasimu. Pembayaran telah berhasil diproses.
                </p>

                {userId && (
                    <Link
                        href={`/donate/${userId}`}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-semibold block mt-4"
                    >
                        Donasi Lagi
                    </Link>
                )}
            </div>
        </div>
    );
}
