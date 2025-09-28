"use client";

import { useState, useEffect, use } from "react";
import Script from "next/script";
import { motion } from "framer-motion";

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
      const res = await fetch(`/api/user/${userId}`, { method: 'GET' });
      const data = await res.json();
      console.log('Midtrans Token:', data);
      setStreamerData(data);
      return data;
    };

    const result = fetchData()
      .catch(console.error);

    console.log(result);
  }, [userId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
          onSuccess: function (result: any) {
            console.log("success", result);
            window.location.href = `/transaction/success?userId=${userId}`;
          },
          onPending: function (result: any) {
            console.log("pending", result);
            window.location.href = `/transaction/success?userId=${userId}`;
          },
          onError: function (result: any) {
            console.error("error", result);
            window.location.href = `/transaction/failed?userId=${userId}`;
          },
          onClose: function () {
            console.log("customer closed popup");
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

      <motion.form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-neutral-900/80 backdrop-blur-sm rounded-xl shadow-lg p-6 flex flex-col gap-5 border border-neutral-700"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <input
          name="donorName"
          placeholder="Nama Anda"
          value={form.donorName}
          onChange={handleChange}
          className="bg-neutral-800 text-white placeholder-gray-400 border border-neutral-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
        />
        <input
          name="donorEmail"
          type="email"
          placeholder="Email Anda"
          value={form.donorEmail}
          onChange={handleChange}
          className="bg-neutral-800 text-white placeholder-gray-400 border border-neutral-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
        />
        <input
          name="amount"
          type="number"
          placeholder="Jumlah Donasi (Rp)"
          value={form.amount}
          onChange={handleChange}
          className="bg-neutral-800 text-white placeholder-gray-400 border border-neutral-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
        />
        <textarea
          name="message"
          placeholder="Pesan untuk streamer"
          value={form.message}
          onChange={handleChange}
          className="bg-neutral-800 text-white placeholder-gray-400 border border-neutral-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
          rows={4}
        />
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg py-3 transition-all shadow-md"
        >
          {loading ? "Memproses..." : "Donasi Sekarang"}
        </motion.button>
      </motion.form>
    </div>
  );
}
