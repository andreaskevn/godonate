import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import midtransClient from "midtrans-client";

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;

  if (!userId) {
    return NextResponse.json(
      { error: "User ID Tidak Ditemukan!" },
      { status: 400 }
    );
  }

  const { amount, message, donorName, donorEmail } = await request.json();

  if (!amount || !donorEmail) {
    return NextResponse.json({ error: "Data Tidak Lengkap!" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return NextResponse.json(
        { error: "User Tidak Ditemukan!" },
        { status: 404 }
      );
    }

    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
      clientKey: process.env.MIDTRANS_CLIENT_KEY!,
    });

    const orderId = `donation-${userId}-${Date.now()}`;

    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: Number(amount),
      },
    });

    const donation = await prisma.donation.create({
      data: {
        amount,
        message,
        donorName,
        donorEmail,
        userId,
        status: "PENDING",
        midtransTransactionId: orderId,
      },
    });

    return NextResponse.json({
      donation,
      transactionToken: transaction.token,
      redirectUrl: transaction.redirect_url,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;

  try {
    const donations = await prisma.donation.findMany({
      where: { userId },
    });

    return NextResponse.json(donations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
