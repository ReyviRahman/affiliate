"use server";

import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Nama minimal 2 karakter.").max(100, "Nama maksimal 100 karakter."),
    email: z
      .string()
      .trim()
      .max(254, "Email maksimal 254 karakter.")
      .email("Masukkan alamat email yang valid.")
      .transform((value) => value.toLocaleLowerCase("en-US")),
    password: z.string().min(8, "Password minimal 8 karakter.").max(72, "Password maksimal 72 karakter."),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak sama.",
    path: ["confirmPassword"],
  });

export type SignupFormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
        confirmPassword?: string[];
      };
      message?: string;
    }
  | undefined;

export async function signup(_previousState: SignupFormState, formData: FormData): Promise<SignupFormState> {
  const result = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const { name, email, password } = result.data;

  try {
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: { id: true },
    });

    if (existingUser) {
      return { errors: { email: ["Email sudah terdaftar."] } };
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({ data: { email, name, passwordHash } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { errors: { email: ["Email sudah terdaftar."] } };
    }

    return { message: "Akun belum dapat dibuat. Silakan coba lagi." };
  }

  redirect("/dashboard");
}
