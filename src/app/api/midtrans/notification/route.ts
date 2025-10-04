import { NextRequest, NextResponse } from "next/server";
import midtransClient from "midtrans-client";
import prisma from "../../../../lib/prisma";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const core = new midtransClient.CoreApi({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
      clientKey: process.env.MIDTRANS_CLIENT_KEY!,
    });

    const statusResponse = await (core as any).transaction.notification(body);

    const orderId = statusResponse.order_id as string;
    const transactionStatus = statusResponse.transaction_status as string;
    const fraudStatus = statusResponse.fraud_status as string;

    const donation = await prisma.donation.findUnique({
      where: { midtransTransactionId: orderId },
    });

    if (!donation) {
      console.error(`Donation with orderId ${orderId} not found.`);
      return NextResponse.json(
        { error: "Donation not found" },
        { status: 404 }
      );
    }

    let newStatus: "PENDING" | "PAID" | "FAILED" = "PENDING";

    if (transactionStatus === "capture") {
      if (fraudStatus === "accept") newStatus = "PAID";
      else newStatus = "FAILED";
    } else if (transactionStatus === "settlement") {
      newStatus = "PAID";
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      newStatus = "FAILED";
    } else if (transactionStatus === "pending") {
      newStatus = "PENDING";
    }

    const updatedDonation = await prisma.donation.update({
      where: { id: donation.id },
      data: {
        userId: donation.userId,
        status: newStatus,
        midtransPayload: statusResponse,
        paidAt: newStatus === "PAID" ? new Date() : null,
      },
    });

    if (newStatus === "PAID") {
      try {
        await fetch("https://ws-server-godonate-production.up.railway.app/api/broadcast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedDonation),
        });
      } catch (broadcastError) {
        console.error("Failed to trigger broadcast:", broadcastError);
      }
    }

    return NextResponse.json({ message: "OK", status: newStatus });
  } catch (err: any) {
    console.error("❌ Midtrans notif error:", err.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
