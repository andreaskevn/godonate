"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LinkIcon, CopyIcon, CheckIcon } from "lucide-react";

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
    const [copied, setCopied] = useState(false);

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

    const handleCopy = async () => {
        if (!userId) return;
        const link = `https://godonate-alpha.vercel.app/donate/${userId}`;
        await navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoadingAuth) return <p className="text-white">Memuat...</p>;

    return (
        <div className="min-h-screen bg-black p-8 text-white">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <Button variant="destructive" onClick={logout}>
                    Logout
                </Button>
            </div>

            {/* Link Donasi */}
            {userId && (
                <div className="mb-6">
                    <p className="text-gray-300">Link Donasi Kamu:</p>
                    <div className="flex gap-2 mt-2 text-black">
                        <a
                            href={`https://godonate-alpha.vercel.app/donate/${userId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button variant="outline" className="flex items-center gap-2 hover:cursor-pointer">
                                <LinkIcon className="w-4 h-4" />
                                Donasi Saya
                            </Button>
                        </a>

                        <Button
                            variant="secondary"
                            onClick={handleCopy}
                            className="flex items-center gap-2 hover:cursor-pointer"
                        >
                            {copied ? (
                                <>
                                    <CheckIcon className="w-4 h-4 text-green-500" />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <CopyIcon className="w-4 h-4" />
                                    Copy Donation Link
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            <Card className="bg-neutral-900 text-white border-neutral-700">
                <CardHeader>
                    <CardTitle>Daftar Donasi</CardTitle>
                </CardHeader>
                <CardContent>
                    {donations.length === 0 ? (
                        <p className="text-gray-400">Belum ada donasi.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {donations.map((d) => (
                                <Card
                                    key={d.id}
                                    className="bg-neutral-800 border border-neutral-700 p-4"
                                >
                                    <CardHeader className="p-0 mb-2">
                                        <CardTitle className="text-base font-semibold text-white">
                                            {d.donorName || "Anonim"}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0 text-sm text-gray-300 space-y-1">
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
                                            <strong>Status:</strong>{" "}
                                            <span
                                                className={`${d.status === "success"
                                                    ? "text-green-400"
                                                    : "text-yellow-400"
                                                    }`}
                                            >
                                                {d.status}
                                            </span>
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>

            </Card>
        </div>
    );
}
