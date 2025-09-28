import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET (request: Request, { params }: { params: { userId: string } }) {
    const { userId } = params;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                username: true,
            }
        });

        
        if(!user) {
            return NextResponse.json({ error: "User Tidak Ditemukan!" }, { status: 404 });
        }
        
        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 404 });
    }
}