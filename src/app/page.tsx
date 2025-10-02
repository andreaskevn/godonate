"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const images = [
  "/stream-hero/streamer1.jpg",
  "/stream-hero/streamer2.jpg",
  "/stream-hero/streamer3.jpg",
  "/stream-hero/streamer4.jpg",
  "/stream-hero/streamer5.jpg",
  "/stream-hero/streamer6.jpg",
];

export default function HomePage() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <motion.div
          key={index}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${images[index]})` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/70 to-black z-10"></div>

      <div className="relative z-20 px-4">
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold text-black mb-6 drop-shadow-lg"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-emerald-400">GoDonate</span>
        </motion.h1>

        <p className="text-gray-300 mb-10 max-w-xl mx-auto text-lg">
          Platform donasi untuk <span className="font-semibold">para streamer</span>.
          Daftarkan akunmu, dapatkan link donasi pribadi,
          dan biarkan penontonmu mendukungmu lebih mudah!
        </p>

        <motion.div
          className="flex gap-4 justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link
            href="/login"
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-md font-semibold text-lg"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-3 rounded-lg shadow-md font-semibold text-lg"
          >
            Register
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
