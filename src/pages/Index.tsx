import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TeachingSection from "@/components/TeachingSection";
import ProjectsSection from "@/components/ProjectsSection";
import TalksSection from "@/components/TalksSection";
import DataRunnerSection from "@/components/DataRunnerSection";
import ContactSection from "@/components/ContactSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <TeachingSection />
      <ProjectsSection />
      <TalksSection />
      <DataRunnerSection />
      <ContactSection />
    </div>
  );
};

export default Index;
