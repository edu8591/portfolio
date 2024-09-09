// "use client";
import { InfoSection, IntroSection } from "@/components";
// import { useEffect, useRef } from "react";

export default function Home() {
  return (
    <main className="grid md:grid-cols-2 h-screen max-w-[1080px] mx-auto pt-5">
      <IntroSection />
      <InfoSection />
    </main>
  );
}
