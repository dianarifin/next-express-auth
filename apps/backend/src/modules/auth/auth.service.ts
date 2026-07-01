import { prisma } from "@repo/database/lib/prisma";
import bcrypt from "bcryptjs";

export interface GoogleProfile {
  id: string;
  emails: { value: string }[];
  displayName: string;
  photos: { value: string }[];
}

// Find an existing user by googleId or create a new one
export async function findOrCreateGoogleUser(profile: GoogleProfile) {
  let user = await prisma.user.findUnique({
    where: { googleId: profile.id },
  });

  if (!user) {
    console.log("[Auth Service] Creating new user");
    user = await prisma.user.create({
      data: {
        googleId: profile.id,
        email: profile.emails?.[0]?.value ?? "",
        name: profile.displayName,
        avatarUrl: profile.photos?.[0]?.value ?? null,
        provider: "google",
      },
    });
  } else {
    console.log("[Auth Service] User already exists");
  }

  return user;
}

// create a new account
export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  // 1. cek apakah email sudah terdaftar
  const existingEmail = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingEmail) {
    throw new Error("Email already registered");
  }

  // 2. hash password(10 salt rounds - standar bcrypt)
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // 3. buat user baru
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      provider: "local",
    },
  });

  return user;
}

// new email and password login
export async function loginWithEmail(email: string, password: string) {
  // cari user by email
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // 2. pastikan user punya password (bukan Google-only user)
  if (!user.password) {
    throw new Error(
      "This account uses Google sign-in. Please sign in with Google",
    );
  }

  // 3. bandingkan password
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  return user;
}
