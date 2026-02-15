import { motion } from "framer-motion";

interface Project {
  title: string;
  description: string;
  tags: string[];
  link?: { label: string; url: string };
}

const projects: Project[] = [
  {
    title: "High-Performance Computing",
    description:
      "Notes on computational methods for economists (with Jesús Fernández-Villaverde and Pablo Guerrón-Quintana). Topics include parallel programming, GPU computing, perturbation methods, and more.",
    tags: ["CUDA", "MPI", "Julia", "C++"],
    link: {
      label: "GitHub Repository",
      url: "https://github.com/davidzarruk/Parallel_Computing",
    },
  },
  {
    title: "La Rama Ciudadana",
    description:
      "A project contributing to national debates with relevant data and statistics through scraping tools and data visualization, jointly with Rodrigo Azuero.",
    tags: ["Data Viz", "Web Scraping"],
    link: {
      label: "Visit site",
      url: "http://www.laramaciudadana.com/",
    },
  },
  {
    title: "gmapsdistance — R Package",
    description:
      "Uses the Google Maps Distance Matrix API to compute distance and travel time between multiple points. Supports bicycling, walking, driving, and transit modes.",
    tags: ["R", "Google Maps API"],
    link: {
      label: "GitHub",
      url: "https://github.com/rodazuero/gmapsdistance",
    },
  },
  {
    title: "Rtauchen — R Package",
    description:
      "Discretizes an AR(1) process following Tauchen (1986). Generates a discrete Markov chain approximating a continuous-valued univariate AR(1) process.",
    tags: ["R", "Econometrics"],
    link: {
      label: "GitHub",
      url: "https://github.com/davidzarruk/Rtauchen",
    },
  },
  {
    title: "Berlin Marathon AI",
    description:
      "An AI-powered tool to answer questions about the Berlin Marathon. A first prototype toward covering all World Marathon Majors.",
    tags: ["AI", "Running", "NLP"],
    link: {
      label: "Try it",
      url: "https://www.davidzarruk.com/berlin.html",
    },
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const ProjectsSection = () => {
  return (
    <section id="projects" className="py-24 px-6 bg-secondary/40">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          className="font-heading text-3xl md:text-4xl text-foreground mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Projects & Research
        </motion.h2>

        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {projects.map((project) => (
            <motion.div
              key={project.title}
              variants={item}
              className="group rounded-xl bg-background p-6 border border-border hover:border-accent/40 transition-all hover:shadow-md"
            >
              <h3 className="font-heading text-lg text-foreground mb-2">
                {project.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs rounded-full bg-secondary px-3 py-1 text-secondary-foreground font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {project.link && (
                <a
                  href={project.link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
                >
                  {project.link.label}
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </a>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectsSection;
