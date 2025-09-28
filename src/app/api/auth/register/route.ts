import { NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import prisma from "../../../../lib/prisma";

export async function POST(request: Request) {
  const { email, username, password } = await request.json();

  try {
    if (!email || !username || !password) {
      return NextResponse.json(
        { error: "Data Tidak Lengkap!" },
        { status: 400 }
      );
    }

    const UserAvailable = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (UserAvailable) {
      throw new Error("User Sudah Terdaftar!");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: email,
        username: username,
        password: hashedPassword,
      },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
