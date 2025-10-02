"use client";

import { useState, useEffect, use } from "react";
import Script from "next/script";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Streamer {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export default function DonatePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    donorName: "",
    donorEmail: "",
    amount: "",
    message: "",
  });
  const [steamerData, setStreamerData] = useState<Streamer | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/user/${userId}`, { method: "GET" });
      const data = await res.json();
      setStreamerData(data);
      return data;
    };

    fetchData().catch(console.error);
  }, [userId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const setAmount = (value: number) => {
    setForm({ ...form, amount: value.toString() });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/donate/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.transactionToken) {
        window.snap.pay(data.transactionToken, {
          onSuccess: () => {
            window.location.href = `/transaction/success?userId=${userId}`;
          },
          onPending: () => {
            window.location.href = `/transaction/success?userId=${userId}`;
          },
          onError: () => {
            window.location.href = `/transaction/failed?userId=${userId}`;
          },
          onClose: () => {
            window.location.href = `/transaction/failed?userId=${userId}`;
          },
        });
      }
    } catch (err) {
      console.error("Error submit:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-neutral-900 to-black p-6">
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
      />

      <motion.h1
        className="text-3xl md:text-4xl font-extrabold text-white mb-8 tracking-wide"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {steamerData ? `Donasi untuk ${steamerData.username}` : "Memuat..."}
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        <Card className="bg-neutral-900/80 border-neutral-700 text-white">
          <CardHeader>
            <CardTitle className="text-lg text-center">Form Donasi</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                name="donorName"
                placeholder="Nama Anda"
                value={form.donorName}
                onChange={handleChange}
                className="h-12 text-base bg-neutral-800 border-neutral-700 text-white placeholder-gray-400"
              />
              <Input
                name="donorEmail"
                type="email"
                placeholder="Email Anda"
                value={form.donorEmail}
                onChange={handleChange}
                className="h-12 text-base bg-neutral-800 border-neutral-700 text-white placeholder-gray-400"
              />
              <div>
                <Input
                  name="amount"
                  type="number"
                  placeholder="Jumlah Donasi (Rp)"
                  value={form.amount}
                  onChange={handleChange}
                  className="h-12 text-base bg-neutral-800 border-neutral-700 text-white placeholder-gray-400"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {[10000, 20000, 50000, 100000].map((val) => (
                    <Button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className="bg-neutral-800 hover:bg-emerald-600 border border-neutral-700 text-white text-sm px-4 py-2"
                    >
                      Rp{val.toLocaleString()}
                    </Button>
                  ))}
                </div>
              </div>
              <Textarea
                name="message"
                placeholder="Pesan untuk streamer"
                value={form.message}
                onChange={handleChange}
                rows={4}
                className="text-base bg-neutral-800 border-neutral-700 text-white placeholder-gray-400 resize-none"
              />
              <Button
                type="submit"
                disabled={loading}
                className="h-12 text-base bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-all shadow-md"
              >
                {loading ? "Memproses..." : "Donasi Sekarang"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
