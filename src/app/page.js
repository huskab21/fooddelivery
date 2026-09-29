import Header from "@/app/(home)/header";
import FoodBanner from "@/app/(home)/foodbanner";
import Footer from "@/app/(home)/footer";
import MenuSection from "@/app/(home)/menu-section";
import BurgerScrollHero from "@/app/_components/BurgerScrollHero";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col justify-between">
      <Header />

      {/* Scroll-driven burger hero */}
      <BurgerScrollHero />

      <div id="menu" className="bg-[#404040] w-full py-10">
        <MenuSection />
      </div>

      <FoodBanner />
      <Footer />
    </main>
  );
}