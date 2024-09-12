import type { Metadata } from "next";
import "./globals.css";
import { Roboto } from "next/font/google";
import { ThemeProvider } from "@/components";

const roboto = Roboto({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eduardo Serrano Portfolio",
  description:
    "Full Stack web developer using React.js, Next.js Nest.js and Ruby on Rails.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.className}  antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
