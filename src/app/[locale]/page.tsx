// "use client";
import { InfoSection, IntroSection } from "@/components";
import { unstable_setRequestLocale } from "next-intl/server";

type HomePageProps = {
  params: { locale: string };
};

export default function Home({ params: { locale } }: HomePageProps) {
  unstable_setRequestLocale(locale);

  return (
    <main className="grid md:grid-cols-5 h-screen max-w-[1080px] mx-auto pt-5">
      <IntroSection />
      <InfoSection />
    </main>
  );
}
