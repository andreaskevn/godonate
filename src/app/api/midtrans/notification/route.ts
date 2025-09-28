import { NextRequest, NextResponse } from "next/server";
import midtransClient from "midtrans-client";
import prisma from "@/lib/prisma";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log(
      "Received raw notification body:",
      JSON.stringify(body, null, 2)
    );

    const core = new midtransClient.CoreApi({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
      clientKey: process.env.MIDTRANS_CLIENT_KEY!,
    });

    const statusResponse = await (core as any).transaction.notification(body);

    const orderId = statusResponse.order_id as string;
    const transactionStatus = statusResponse.transaction_status as string;
    const fraudStatus = statusResponse.fraud_status as string;

    console.log("🔔 Midtrans notif verified:", statusResponse);

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

    console.log(
      `✅ Successfully updated donation ${donation.id} to ${newStatus}`
    );
    console.log("newStatus", newStatus);

    if (newStatus === "PAID") {
      try {
        console.log("🚀 Triggering WebSocket broadcast...");
        await fetch("http://localhost:3000/api/broadcast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedDonation),
        });
        console.log("✅ Broadcast signal sent successfully.");
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
