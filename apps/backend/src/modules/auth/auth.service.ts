import { prisma } from "@repo/database/lib/prisma";

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
