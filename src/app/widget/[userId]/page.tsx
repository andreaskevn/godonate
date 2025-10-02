"use client";

import { useEffect, useState, use, useRef } from "react";

type Donation = {
  id: string;
  userId: string;
  donorName: string;
  amount: string;
  message?: string;
};

export default function DonateWidget({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const { userId } = use(params);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttempt = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const enableSound = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        audioRef.current!.pause();
        audioRef.current!.currentTime = 0;
        setSoundEnabled(true);
      }).catch(err => console.error("Enable sound failed:", err));
    }
  };

  useEffect(() => {
    audioRef.current = new Audio("@/../../sfx/notification.mp3");
  }, []);

  useEffect(() => {
    if (!userId) return;

    const connect = () => {
      const socket = new WebSocket(`ws://localhost:3000/ws/donations`);
      socketRef.current = socket;

      socket.onopen = () => {
        reconnectAttempt.current = 0;
      };

      socket.onerror = (error) => {
        console.error("WebSocket Error:", error);
      };

      socket.onmessage = (event) => {
        try {
          const data: Donation = JSON.parse(event.data);

          if (data.userId === userId) {
            setDonations((prev) => [data, ...prev]);

            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play().catch((err) => {
                console.warn("Audio play blocked:", err);
              });
            }

            if (soundEnabled && audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play().catch(err => console.warn("Audio play blocked:", err));
            }
            setTimeout(() => {
              setDonations((prev) => prev.filter((d) => d.id !== data.id));
            }, 5000);
          } else {
          }
        } catch (err) {
          console.error("WS message error:", err);
        }
      };

      socket.onclose = (event) => {
        if (event.code === 1006) {
          reconnectAttempt.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempt.current), 10000);
          setTimeout(() => {
            connect();
          }, delay);
        }
      };
    }

    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.onclose = null;
        socketRef.current.close(1000);
      }
    };
  }, [userId, soundEnabled]);

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-start p-4 text-white">
      <h1 className="text-xl font-bold mb-4">
        Donasi Terbaru untuk {userId}
      </h1>

      <div className="flex flex-col gap-3 w-full max-w-md">
        {donations.map((d) => (
          <div
            key={d.id}
            className="bg-black/60 rounded-xl p-4 border border-white/20 animate-bounce"
          >
            <p className="font-semibold">{d.donorName}</p>
            <p className="text-green-400">Rp {Number(d.amount).toLocaleString()}</p>
            {d.message && <p className="italic text-sm">{d.message}</p>}
          </div>
        ))}
      </div>

      {!soundEnabled && (
        <button
          onClick={enableSound}
          className="px-4 py-2 bg-green-600 rounded-lg"
        >
          🔊 Enable Sound
        </button>
      )}
    </div>
  );
}

