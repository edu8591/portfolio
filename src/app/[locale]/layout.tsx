import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  unstable_setRequestLocale,
} from "next-intl/server";

import "../globals.css";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import { ThemeProvider } from "@/components";
import { routing } from "@/i18n/routing";

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

const plusJakartaSans = Plus_Jakarta_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

const playfairDisplay = Playfair_Display({
  weight: ["600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-playfair-display",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale },
}: Omit<Props, "children">) {
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("title"),
    description: t("description"),
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
    creator: "Eduardo Serrano",
  };
}

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
      <body className={`${plusJakartaSans.variable} ${playfairDisplay.variable} antialiased`}>
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
