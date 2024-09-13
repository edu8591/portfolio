// "use client";
import { InfoSection, IntroSection } from "@/components";

export default function Home() {
  return (
    <main className="grid md:grid-cols-5 h-screen max-w-[1080px] mx-auto pt-5">
      <IntroSection />
      <InfoSection />
    </main>
  );
}
