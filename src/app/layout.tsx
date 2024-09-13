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
