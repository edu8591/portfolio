import {
  InfoSection,
  IntroSection,
  LocaleSwitcher,
  ThemeSwitcher,
} from "@/components";
import { unstable_setRequestLocale } from "next-intl/server";

type HomePageProps = {
  params: { locale: string };
};

export default function Home({ params: { locale } }: HomePageProps) {
  unstable_setRequestLocale(locale);

  return (
    <main className="min-h-screen bg-background">
      <nav className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-end gap-3">
          <ThemeSwitcher />
          <LocaleSwitcher />
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-4">
            <div className="sticky top-20">
              <IntroSection />
            </div>
          </div>
          <div className="lg:col-span-8">
            <InfoSection />
          </div>
        </div>
      </div>
    </main>
  );
}
