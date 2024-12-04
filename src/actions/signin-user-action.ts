"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

type Res =
  | { success: true }
  | { success: false; error: string; statusCode: 401 | 500 };

export async function signinUserAction(values: unknown): Promise<Res> {
  // The auth logic will be done in our AuthJS configuration files.
  try {
    if (
      typeof values !== "object" ||
      values === null ||
      Array.isArray(values)
    ) {
      throw new Error("invalid JSON Object");
    }

    await signIn("credentials", { ...values, redirect: false });
  } catch (err) {
    if (err instanceof AuthError) {
      switch (err.type) {
        case "CredentialsSignin":
        case "CallbackRouteError":
          return {
            success: false,
            error: "Invalid credentials",
            statusCode: 401,
          };
        default:
          return {
            success: false,
            error: "Oops. SOmething went wrong",
            statusCode: 500,
          };
      }
    }

    console.error(err);
    return { success: false, error: "Internal Service Error", statusCode: 500 };
  }

  return { success: true };
}
