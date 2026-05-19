import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";

const handler = NextAuth({
  adapter: MongoDBAdapter(clientPromise),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  jwt: {
    encode: async ({ secret, token }) => {
      if (!token) return "";

      return jwt.sign(token, secret, {
        algorithm: "HS256",
      });
    },

    decode: async ({ secret, token }) => {
      if (!token) return null;

      try {
        return jwt.verify(token, secret, {
          algorithms: ["HS256"],
        }) as any;
      } catch {
        return null;
      }
    },
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }

      return token;
    },

    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          email: token.email as string,
          image: token.picture as string,
        },
        accessToken: jwt.sign(
          token,
          process.env.NEXTAUTH_SECRET || "lawgpt_super_secret_key",
          {
            algorithm: "HS256",
          }
        ),
      };
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };