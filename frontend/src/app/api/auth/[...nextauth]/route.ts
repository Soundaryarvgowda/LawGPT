import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  jwt: {
    encode: ({ secret, token }: any) => {
      // Use HS256 to be easily verifiable by FastAPI
      return jwt.sign(token, secret, { algorithm: "HS256" });
    },
    decode: async ({ secret, token }: any) => {
      if (!token) return null;
      try {
        const verify = jwt.verify(token, secret, { algorithms: ["HS256"] });
        return verify as any;
      } catch (error) {
        return null;
      }
    },
  },
  callbacks: {
    async jwt({ token, user, account }: any) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.image = token.picture;
      }
      // Pass token to client side for API calls
      session.accessToken = jwt.sign(token, process.env.NEXTAUTH_SECRET || "lawgpt_super_secret_key", { algorithm: "HS256" });
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "lawgpt_super_secret_key",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
