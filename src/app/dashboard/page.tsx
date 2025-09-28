"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

type Donation = {
    id: string;
    donorName: string | null;
    donorEmail: string | null;
    amount: string;
    message: string | null;
    status: string;
};

export default function DashboardPage() {
    const { isAuthenticated, token, logout, isLoadingAuth, userId } = useAuth();
    const router = useRouter();
    const [donations, setDonations] = useState<Donation[]>([]);
    console.log("Dashboard Render - isAuthenticated:", isAuthenticated, "isLoadingAuth:", isLoadingAuth, "userId:", userId);

    useEffect(() => {
        if (isLoadingAuth) return; 

        if (!isAuthenticated) {
            router.push("/login");
        } else {
            fetchDonations();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, isLoadingAuth]);

    const fetchDonations = async () => {
        try {
            const res = await fetch(`/api/donate/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setDonations(await res.json());
            }
        } catch (err) {
            console.error("Gagal fetch donasi:", err);
        }
    };

    if (isLoadingAuth) return <p className="text-white">Memuat...</p>;

    return (
        <div className="min-h-screen bg-black p-8 text-white">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <button
                    onClick={logout}
                    className="bg-red-600 px-4 py-2 rounded-lg text-white"
                >
                    Logout
                </button>
            </div>

            {userId && (
                <div className="mb-6">
                    <p className="text-gray-300">Link Donasi Kamu:</p>
                    <a
                        href={`http://localhost:3000/donate/${userId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 underline"
                    >
                        {`http://localhost:3000/donate/${userId}`}
                    </a>
                </div>
            )}

            <div className="bg-neutral-900 rounded-lg p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Daftar Donasi</h2>
                {donations.length === 0 ? (
                    <p className="text-gray-400">Belum ada donasi.</p>
                ) : (
                    <ul className="space-y-4">
                        {donations.map((d) => (
                            <li
                                key={d.id}
                                className="border border-neutral-700 rounded-lg p-4"
                            >
                                <p>
                                    <strong>Dari:</strong> {d.donorName || "Anonim"}
                                </p>
                                <p>
                                    <strong>Email:</strong> {d.donorEmail || "-"}
                                </p>
                                <p>
                                    <strong>Jumlah:</strong> Rp {d.amount}
                                </p>
                                <p>
                                    <strong>Pesan:</strong> {d.message || "-"}
                                </p>
                                <p>
                                    <strong>Status:</strong> {d.status}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
