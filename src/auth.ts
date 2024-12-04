import NextAuth from "next-auth";
import credentials from "next-auth/providers/credentials";
import * as v from "valibot";
import { SigninSchema } from "./validators/signin-validator";
import { findUserByEmail } from "@/resources/user-queries";
import argon2 from "argon2";
const nextAuth = NextAuth({
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  pages: { signIn: "/auth/signin" },
  providers: [
    credentials({
      async authorize(credentials) {
        const parsedCredentials = v.safeParse(SigninSchema, credentials);

        if (parsedCredentials) {
          const { email, password } = parsedCredentials.output;

          //  LOOK FOR OUR USER IN THE DATABASE
          const user = await findUserByEmail(email);
          if (!user) return null;
          if (!user.password) return null;

          const passwordsMatch = await argon2.verify(user.password, password);
          if (passwordsMatch) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
          }
        }

        return null;
      },
    }),
  ],
});

export const { signIn, auth } = nextAuth;
