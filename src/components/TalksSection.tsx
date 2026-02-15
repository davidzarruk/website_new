import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface Talk {
  title: string;
  event: string;
  location: string;
  year: string;
  eventUrl?: string;
  role?: string;
  slidesUrl?: string;
  talkKey: string;
}

const talks: Talk[] = [
  {
    title: "Workshop Presenter",
    event: "Speeding Up Empirical Research: Tools and Techniques for Fast Computing (Banco de Portugal)",
    eventUrl: "https://www.bportugal.pt/en/evento/workshop-speeding-empirical-research-tools-and-techniques-fast-computing-bplim",
    talkKey: "workshop-2025",
    location: "Porto, Portugal",
    year: "2025",
    role: "Presenter",
  },
  {
    title: "Keynote Speaker",
    event: "International Conference on Machine Learning (ICML) — Latin x AI",
    eventUrl: "https://www.latinxinai.org/icml-2024?srsltid=AfmBOoqkqdwA1ApdiZeV_9ENQUIfbGXeIFVynT5hcwj8gA3ir636d-SA",
    talkKey: "icml-2024",
    location: "Vienna, Austria",
    year: "2024",
    role: "Keynote speaker",
  },
  {
    title: "Keynote Speaker",
    event: "Symposium on Statistical Challenges in Electronic Commerce Research",
    eventUrl: "https://web.archive.org/web/20230925101827/https://scecr.com/program-2/",
    talkKey: "scecr-2023",
    location: "Bogotá, Colombia",
    year: "2023",
    role: "Keynote speaker",
  },
  {
    title: "High Performance Computing Panel",
    event: "Platform for Advanced Scientific Computing (PASC) Conference",
    eventUrl: "https://pasc19.pasc-conference.org/",
    talkKey: "pasc-2019",
    location: "Zurich, Switzerland",
    year: "2019",
    role: "Presenter",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const TalksSection = () => {
  const [slideUrls, setSlideUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchSlides = async () => {
      const { data } = await supabase.from("talk_slides").select("talk_key, file_path");
      if (data) {
        const urls: Record<string, string> = {};
        for (const row of data as { talk_key: string; file_path: string }[]) {
          const { data: urlData } = supabase.storage.from("talk-slides").getPublicUrl(row.file_path);
          urls[row.talk_key] = urlData.publicUrl;
        }
        setSlideUrls(urls);
      }
    };
    fetchSlides();
  }, []);

  return (
    <section id="talks" className="py-24 px-6 bg-secondary/40">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          className="font-heading text-3xl md:text-4xl text-foreground mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Talks & Conferences
        </motion.h2>

        <motion.div
          className="grid gap-6 md:grid-cols-2"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {talks.map((talk) => (
            <motion.div
              key={`${talk.event}-${talk.year}`}
              variants={itemVariant}
              className="group rounded-xl bg-card p-6 border border-border hover:border-accent/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-heading text-lg text-foreground leading-snug">
                  {talk.eventUrl ? (
                    <a href={talk.eventUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                      {talk.event}
                    </a>
                  ) : (
                    talk.event
                  )}
                </h3>
                <span className="shrink-0 text-sm text-muted-foreground font-medium">
                  {talk.year}
                </span>
              </div>

              {talk.role && (
                <span className="inline-block rounded-full bg-accent/10 text-accent text-xs font-medium px-3 py-1 mb-3">
                  {talk.role}
                </span>
              )}

              <p className="text-sm text-muted-foreground mb-4">
                📍 {talk.location}
              </p>

              {slideUrls[talk.talkKey] ? (
                <a
                  href={slideUrls[talk.talkKey]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                  </svg>
                  View slides
                </a>
              ) : (
                <span className="text-xs text-muted-foreground/60 italic">
                  Slides coming soon
                </span>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TalksSection;
