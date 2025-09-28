import { NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import prisma from "@/lib/prisma";
import type {
  LoginApiResponse,
  UserSafeData,
  LoginFormState,
} from "@/lib/type";

export async function POST(
  request: Request
): Promise<NextResponse<LoginApiResponse>> {
  try {
    const body: LoginFormState = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email dan password wajib diisi", error: "Bad Request" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Email atau password salah", error: "Unauthorized" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Email atau password salah", error: "Unauthorized" },
        { status: 401 }
      );
    }

    const jwtSecret = process.env.JWT_SECRET;
    const _jwtExpiresIn = process.env.JWT_EXPIRES_IN;

    if (!jwtSecret) {
      console.error("JWT_SECRET tidak ditemukan di environment variables.");
      return NextResponse.json(
        {
          message: "Kesalahan konfigurasi server",
          error: "Internal Server Error",
        },
        { status: 500 }
      );
    }

    const payload = {
      userId: user.id,
      email: user.email,
    };

    const signOptions: SignOptions = {
      expiresIn: "1h",
    };

    const token = jwt.sign(payload, jwtSecret, signOptions);

    console.log("Token:", token);

    const { password: _password, ...userWithoutPassword } = user;

    console.log("typeofWindow:", typeof window);
    if (typeof window !== "undefined") {
      localStorage.setItem("token", JSON.stringify(token));
    }

    const responseUser: UserSafeData = {
      id: userWithoutPassword.id,
      email: userWithoutPassword.email,
      name: userWithoutPassword.username,
    };

    return NextResponse.json(
      {
        message: "Login berhasil",
        user: responseUser,
        token: token,
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("Login Error:", e);
    const errorMessage =
      e instanceof Error ? e.message : "Terjadi kesalahan internal";
    return NextResponse.json(
      {
        message: "Login gagal, terjadi kesalahan pada server",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
