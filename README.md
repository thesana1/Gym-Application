# Next.js Starter

Production-ready Next.js 16 starter with App Router, TypeScript, Tailwind CSS,
shadcn/ui, NextAuth v5, MongoDB via Mongoose, Zustand, Zod, and Vitest.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript strict mode |
| Auth | NextAuth v5 with Credentials and Google OAuth |
| Database | MongoDB with Mongoose |
| Styling | Tailwind CSS and shadcn/ui |
| Validation | Zod, react-hook-form, zodResolver |
| State | Zustand vanilla store with React context |
| Testing | Vitest and Testing Library |
| Linting | ESLint, Next core web vitals, import/order |
| Git hooks | Husky pre-commit: lint, build, test:run |

## Getting Started

Install dependencies:

```bash
npm install
```

Create local environment:

```bash
cp .env.example .env.local
```

Required values:

```env
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=your-generated-secret
MONGO_URI=mongodb://localhost:27017/nextjs-starter
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
DODO_PAYMENTS_API_KEY=your-api-key
DODO_PAYMENTS_WEBHOOK_KEY=your-webhook-signing-key
DODO_PAYMENTS_ENVIRONMENT=test_mode
```

Generate a secret with `openssl rand -base64 32`. Keep the same `AUTH_SECRET`
across app instances and deployments so existing sessions remain valid. For
backward compatibility, the app also accepts `NEXTAUTH_SECRET`.

The protected dashboard includes an image uploader. Each image is limited to
3 MB, resized to fit within 2048 × 2048 pixels, converted to WebP, and uploaded
to the `gym-application` Cloudinary folder. Set the Cloudinary credentials above
to enable uploads.

### Membership subscriptions

Open `/dashboard/membership` to purchase **Premium for USD 20/month** or
an **individual consultation credit for USD 20**. Premium includes unlimited photo
uploads, all existing fitness features without usage caps, and coach consultation
requests. Other fitness features keep their existing free access; no additional
free-plan quotas have been invented. Each image still has a 3 MB file-size limit.

Products are created dynamically on the first checkout and reused through a
MongoDB catalog. No product IDs are needed in the environment. Update prices in
`src/shared/const/membership-payments.const.ts` to provision a new price for future
purchases; existing subscriptions retain their provider billing agreements.
Applicable taxes are calculated at checkout. Credentials and purchase records are
separated by test/live environment. The accepted settings are `test` / `test_mode`
and `live` / `live_mode`; invalid values are rejected.

Create a Dodo webhook for your public HTTPS host at `/api/webhooks/dodo`.
Subscribe to all **subscription** and **payment** events plus `refund.succeeded`.
Copy that endpoint's signing secret into `DODO_PAYMENTS_WEBHOOK_KEY`. The endpoint
verifies the exact raw request body using the official SDK, retrieves current
provider state, and ignores stale updates. Checkout redirects never grant access.

For local development, expose port 3000 through an HTTPS tunnel. Dodo cannot reach
`localhost` directly. Set `NEXTAUTH_URL` to the tunnel's origin, open the app using
that origin, register its webhook URL in Dodo test mode, and restart the server.
Use the signing secret for that exact endpoint. A deployed app uses its deployed
HTTPS origin instead. Before accepting live payments, configure live credentials
and a live webhook endpoint.

The Membership page provides a customer portal for billing management. Cancellation
keeps access until the end of the paid billing period. Paused, on-hold, past-due,
failed, expired, and fully refunded current periods do not grant Premium. A later
paid renewal can restore access. Existing pending checkouts are reused; unknown
outcomes after a timeout remain pending for up to 24 hours to avoid immediately
creating another payable session.

The image-upload API checks paid access on the server for non-admin users, with
no upload-count quota for Premium. Cloudinary credentials are still required to
store images. Administrators retain their existing upload access.

Coach requests are included for Premium. Other members must first buy a credit.
A credit is reserved by an active request, with a unique database constraint
preventing concurrent double spending. Declining or cancelling the request frees
the credit for reuse. A full refund removes the credit and cancels its active
request. Coach acceptance and appointment scheduling remain separate: payment
buys a consultation credit, not a guaranteed appointment time.

To verify the integration, complete a Dodo test checkout and check that Premium
appears after webhook confirmation. Replay the same webhook to check idempotency,
then test cancellation and full refunds. On a free account, purchase a consultation
credit and send a coach request; a second active request cannot reuse that credit.
Decline or cancel the request and check that the credit becomes available again.

Start development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Reusable email sender (Nodemailer)

Email sending is available to server-side code through
`sendEmailService` from `@/features/email/service/email.service`. Nothing sends
an email automatically, and there is no public send-email endpoint.

Configure your SMTP provider in the ignored `.env` file:

```env
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_REQUIRE_TLS=true
SMTP_USER=your-smtp-username
SMTP_PASSWORD=your-smtp-password
SMTP_FROM_EMAIL=no-reply@your-domain.com
SMTP_FROM_NAME=Gym Application
```

Use the SMTP credentials supplied by your provider and an authorized sender
address. Port 587 uses STARTTLS; port 465 uses implicit TLS (`SMTP_SECURE=true`).
If `SMTP_SECURE` is omitted, implicit TLS is selected automatically for port 465.
Restart the server after changing SMTP settings. The transport is initialized
lazily and reused. Missing email configuration does not prevent the app starting.

Call the reusable service from a trusted server-side flow:

```ts
import { sendEmailService } from '@/features/email/service/email.service';

const result = await sendEmailService({
  to: 'member@example.com',
  subject: 'Your workout is ready',
  text: 'Sign in to view your workout plan.',
  // Optional: html and replyTo. Plain text is always required.
});
```

The result follows the existing `{ data, status }` convention. Success returns
`{ messageId }`, indicating SMTP acceptance, which does not guarantee inbox
delivery. Invalid messages return 400, missing/invalid configuration returns 503,
and sending failures return 502 with a generic error code. The sender address
comes from server configuration. No automatic retries are performed because a
failed connection can leave delivery uncertain.

`mailer.verify()` from `@/shared/lib/mailer` checks SMTP connectivity and
credentials without sending a message. It cannot confirm that a provider accepts
your chosen sender address. Delivery has not been tested against a real provider
until valid SMTP settings are configured.

For local capture servers such as Mailpit, use its host and port (commonly 1025),
set `SMTP_SECURE=false` and `SMTP_REQUIRE_TLS=false`, and omit both `SMTP_USER` and
`SMTP_PASSWORD`. Production defaults require encrypted SMTP. Supplying only one
of the username/password pair is rejected. Message content is limited to explicit
validated fields, with no attachments, arbitrary headers, file paths, or URL fetches.

Nodemailer is pinned to a patched major release through the package override so
Auth.js's optional older mailer peer does not downgrade the reusable sender.
The app's existing credentials/Google authentication flows are unchanged.

## Scripts

```bash
npm run dev          # Start local dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run typecheck    # TypeScript check
npm run test         # Vitest watch mode
npm run test:run     # Vitest one-shot run
npm run test:cov     # Vitest coverage report
```

Run one test file:

```bash
npx vitest run src/features/auth/service/auth.service.spec.ts
```

## Project Structure

```text
src/
  app/
    (public)/                  Public routes: home, sign-in, sign-up
    (protected)/               Auth-protected routes: dashboard
    api/                       Thin route handlers
    globals.css                Tailwind theme and CSS variables
    layout.tsx                 Root metadata, fonts, theme provider
  features/
    auth/
      components/              Forms and auth page shell
      hooks/                   Store hook and async auth actions
      repository/              Mongoose query layer
      schema/                  User schema and inferred document type
      service/                 Business logic returning ServiceResult
      store/                   Zustand vanilla store factory
      types/                   Auth feature types
      validations/             Zod schemas
    dashboard/
      components/              Protected dashboard UI
    marketing/
      components/              Public home page UI
  shared/
    components/                Layout and shadcn/ui primitives
    const/                     Static app, route, nav, and page constants
    hooks/                     Cross-feature React hooks
    lib/                       OOP singleton libraries with tests
    middleware/                Request validation helpers
    providers/                 App providers
    types/                     Shared service/result types
    utils/                     Small shared utilities with tests
  proxy.ts                     Cookie-based route protection
```

## Architecture Rules

- Page files stay thin. Layout and structural UI live in components.
- API routes validate input with `validateBody`, call one service, and return JSON.
- Services own business decisions and always return `{ data, status }`.
- Repositories only perform raw database queries and call `mongo.connect()` first.
- Static arrays and reusable constants live in `src/shared/const`.
- Cross-directory imports use the `@/` alias.
- Forms use `react-hook-form` with `zodResolver`.
- Shared `lib` files use class syntax, export a singleton, and have co-located tests.

## Docker

Start app and local MongoDB (Compose loads app credentials from `.env`
and connects the app container to the `mongo` service):

```bash
docker compose up
```

Run in background:

```bash
docker compose up -d
```

Rebuild:

```bash
docker compose up --build
```

Stop:

```bash
docker compose down
```

Wipe local MongoDB data:

```bash
docker compose down -v
```

## Production Notes

- `next.config.ts` pins Turbopack root to this repository to avoid parent-lockfile
  workspace inference.
- Remote image optimization is limited to Google OAuth avatars by default.
- `npm audit fix` has been applied without force. A package override keeps
  transitive `postcss` on the patched version used by the toolchain.
