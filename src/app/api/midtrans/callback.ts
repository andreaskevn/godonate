import type { NextApiRequest, NextApiResponse } from "next";
import { broadcastDonation } from "@/lib/websocket";


export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const donation = req.body; // donasi hasil callback
    broadcastDonation(donation); // kirim ke semua WS client

    res.status(200).json({ success: true });
  } else {
    res.status(405).end();
  }
}
