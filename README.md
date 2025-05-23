This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, install the dependencies.

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Second, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Environment Variables Setup

Before running the application, you need to set up the following environment variables in a `.env` file at the root of the project:

```bash
# SailPoint ISC Configuration
ISC_BASE_API_URL=your_isc_api_url
ISC_BASE_URL=your_isc_base_url
ISC_CLIENT_ID=your_client_id
ISC_CLIENT_SECRET=your_client_secret

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
```

Replace the placeholder values with your actual credentials:

- For SailPoint ISC credentials, you'll need to obtain these from your SailPoint ISC instance reference this article [Next-Auth (Auth.js) integration with ISC OAuth](https://developer.sailpoint.com/discuss/t/next-auth-auth-js-integration-with-isc-oauth/56341)
- For NextAuth, generate a secure random string for NEXTAUTH_SECRET
- For OpenAI, use your API key from the OpenAI platform [OpenAI Platform](https://platform.openai.com/api-keys)

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
