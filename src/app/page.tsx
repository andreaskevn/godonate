"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-neutral-900 to-black p-6 text-center">
      <motion.h1
        className="text-4xl md:text-5xl font-extrabold text-white mb-6"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Selamat Datang di <span className="text-emerald-400">GoDonate</span>
      </motion.h1>

      <p className="text-gray-400 mb-8 max-w-md">
        Platform untuk mendukung streamer favoritmu melalui donasi online.
      </p>

      <div className="flex gap-4">
        <Link
          href="/login"
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-md font-semibold"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-3 rounded-lg shadow-md font-semibold"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
