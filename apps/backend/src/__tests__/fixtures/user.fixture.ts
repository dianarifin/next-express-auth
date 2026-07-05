
export const mockUser = {
  id: "test-user-id",
  email: "test@example.com",
  name: "Test User",
  password: "$2a$10$mocked-hash",
  avatarUrl: null,
  role: "USER" as const,
  provider: "local",
  tokenVersion: 0,
  emailVerified: false,
  googleId: null,
  verificationToken: null,
  verificationTokenExpiresAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};
