import { motion } from "framer-motion";

interface Talk {
  title: string;
  event: string;
  location: string;
  year: string;
  role?: string;
  slidesUrl?: string;
}

const talks: Talk[] = [
  {
    title: "Keynote Speaker",
    event: "International Conference on Machine Learning (ICML) — Latin x AI",
    location: "Vienna, Austria",
    year: "2024",
    role: "Keynote speaker",
  },
  {
    title: "Keynote Speaker",
    event: "Symposium on Statistical Challenges in Electronic Commerce Research",
    location: "Bogotá, Colombia",
    year: "2023",
    role: "Keynote speaker",
  },
  {
    title: "High Performance Computing Panel",
    event: "Platform for Advanced Scientific Computing (PASC) Conference",
    location: "Zurich, Switzerland",
    year: "2019",
    role: "Panelist",
  },
  {
    title: "Workshop Presenter",
    event: "Speeding Up Empirical Research: Tools and Techniques for Fast Computing",
    location: "Porto, Portugal",
    year: "2025",
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
                  {talk.event}
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

              {talk.slidesUrl ? (
                <a
                  href={talk.slidesUrl}
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
