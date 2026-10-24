import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

import { userRepository } from '@/features/auth/repository/user.repository';
import { upsertOAuthUserService } from '@/features/auth/service/auth.service';
import type { MembershipSummary } from '@/features/membership/types/membership.types';
import { hashPassword } from '@/shared/utils/password';

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await userRepository.findByEmail(credentials.email as string);
        if (!user) return null;

        const passwordHash = hashPassword(credentials.password as string);
        if (user.passwordHash !== passwordHash) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role as 'user' | 'admin',
          avatar: user.avatar,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'google' || !user.email || !user.name) {
        return true;
      }

      await upsertOAuthUserService({
        email: user.email,
        name: user.name,
        avatar: user.image ?? null,
      });

      return true;
    },

    async jwt({ token, user }) {
      const authUser = user as ({ role?: 'admin' | 'user'; avatar?: string | null } & typeof user) | undefined;
      const membershipToken = token as typeof token & {
        membership?: MembershipSummary | null;
      };

      if (user) {
        token.id = authUser?.id ?? token.sub ?? '';
        token.email = user.email;
        token.name = user.name;
        token.avatar = authUser?.avatar ?? (token.avatar as string | null | undefined);
      }

      if (token.email) {
        const dbUser = await userRepository.findByEmail(token.email as string);
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.name = dbUser.name;
          token.avatar = dbUser.avatar ?? (token.avatar as string | null | undefined);
          token.role = (dbUser.role as 'admin' | 'user') ?? 'user';
          membershipToken.membership = dbUser.membership
            ? {
              tier: dbUser.membership.tier,
              status: dbUser.membership.status,
              subscriptionId: dbUser.membership.subscriptionId,
              nextBillingDate: dbUser.membership.nextBillingDate?.toISOString(),
              cancelAtPeriodEnd: dbUser.membership.cancelAtPeriodEnd,
            }
            : null;
        } else {
          token.role = 'user';
          membershipToken.membership = null;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        const membershipToken = token as typeof token & {
          membership?: MembershipSummary | null;
        };
        const user = session.user as typeof session.user & {
          id: string;
          role: 'admin' | 'user';
          avatar?: string | null;
          membership?: MembershipSummary | null;
        };
        user.id = token.id as string;
        user.email = token.email as string;
        user.name = token.name as string;
        user.avatar = (token.avatar as string | null | undefined) ?? null;
        user.role = (token.role as 'admin' | 'user' | undefined) ?? 'user';
        user.membership = membershipToken.membership ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/sign-in',
  },
});
