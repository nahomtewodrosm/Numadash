import { GameSection } from "@/components/sections/GameSection";
import { Hero } from "@/components/sections/Hero";
import { HowToPlay } from "@/components/sections/HowToPlay";
import { Leaderboard } from "@/components/sections/Leaderboard";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { StackSection } from "@/components/sections/StackSection";
import { Ticker } from "@/components/sections/Ticker";

export default function Home() {
  return (
    <>
      <Hero />
      <Ticker />
      <GameSection />
      <Leaderboard />
      <HowToPlay />
      <StackSection />
      <ProjectsSection />
    </>
  );
}
