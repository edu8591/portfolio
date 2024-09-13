import { NextIntlClientProvider } from "next-intl";
import { getMessages, unstable_setRequestLocale } from "next-intl/server";

// import type { Metadata } from "next";
import "../globals.css";
import { Roboto } from "next/font/google";
import { ThemeProvider } from "@/components";
import { routing } from "@/i18n/routing";
import { Metadata } from "next";

const roboto = Roboto({
  weight: "400",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Eduardo Serrano Portfolio",
  description:
    "Welcome to Eduardo Serrano’s portfolio! As a passionate fullstack web development, Focused on applying core technologies such as Ruby on Rails, React, and Next.js for front-end development, alongside backend solutions using Node.js and NestJS.",
  authors: [{ name: "Eduardo Serrano" }],
  keywords: [
    "fullstack web developer",
    "React",
    "Next.js",
    "Node.js",
    "Ruby on Rails",
    "web development portfolio",
    "Eduardo Serrano",
  ],
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${roboto.className}  antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
