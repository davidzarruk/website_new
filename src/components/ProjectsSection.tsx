import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface ResourceLink {
  label: string;
  url: string;
}

interface ResourceGroup {
  title: string;
  links: ResourceLink[];
}

interface Project {
  title: string;
  description: string;
  tags: string[];
  link?: { label: string; url: string };
  resources?: ResourceGroup[];
}

const projects: Project[] = [
  {
    title: "High-Performance Computing",
    description:
      "Notes on computational methods for economists (with Jesús Fernández-Villaverde and Pablo Guerrón-Quintana). Parallel and GPU computing applied to structural models.",
    tags: ["CUDA", "MPI", "Julia", "C++"],
    link: {
      label: "GitHub Repository",
      url: "https://github.com/davidzarruk/Parallel_Computing",
    },
    resources: [
      {
        title: "High-Performance Computing in Economics",
        links: [
          { label: "HPC in Economics", url: "https://www.davidzarruk.com/files/Computation/Lecture_HPC_1_HPC_Economics.pdf" },
          { label: "Software Engineering", url: "https://www.davidzarruk.com/files/Computation/Lecture_HPC_2_Software_Engineering.pdf" },
          { label: "OS and Basic Utilities", url: "https://www.davidzarruk.com/files/Computation/Lecture_HPC_3_OS_Basic_Utilities.pdf" },
          { label: "Programming Languages Concepts", url: "https://www.davidzarruk.com/files/Computation/Lecture_HPC_4_Programming_Languages_Concepts.pdf" },
          { label: "Scientific Computing Languages", url: "https://www.davidzarruk.com/files/Computation/Lecture_HPC_5_Scientific_Computing_Languages.pdf" },
          { label: "Coding Tools", url: "https://www.davidzarruk.com/files/Computation/Lecture_HPC_6_Coding_Tools.pdf" },
          { label: "Programming Paradigms", url: "https://www.davidzarruk.com/files/Computation/Lecture_HPC_7_Programming_Paradigms.pdf" },
          { label: "Elements of Programming Style", url: "https://www.davidzarruk.com/files/Computation/Lecture_HPC_8_Elements_Programming_Style.pdf" },
          { label: "Data Handling", url: "https://www.davidzarruk.com/files/Computation/Lecture_HPC_9_Data_Handling.pdf" },
          { label: "Web Scraping", url: "https://www.davidzarruk.com/files/Computation/Lecture_HPC_10_Web_Scrapping.pdf" },
          { label: "Parallel Programming", url: "https://www.davidzarruk.com/files/Computation/Lecture_HPC_11_Parallelization.pdf" },
        ],
      },
      {
        title: "Perturbation Methods",
        links: [
          { label: "I: Basic Results", url: "https://www.davidzarruk.com/files/Computation/Lecture_SM_5_Perturbation_I.pdf" },
          { label: "II: General Case", url: "https://www.davidzarruk.com/files/Computation/Lecture_SM_6_Perturbation_II.pdf" },
          { label: "III: Change of Variables", url: "https://www.davidzarruk.com/files/Computation/Lecture_SM_7_Perturbation_III.pdf" },
          { label: "IV: Perturbing the Value Function", url: "https://www.davidzarruk.com/files/Computation/Lecture_SM_8_Perturbation_IV.pdf" },
          { label: "V: Pruning", url: "https://www.davidzarruk.com/files/Computation/Lecture_SM_9_Perturbation_V.pdf" },
        ],
      },
      {
        title: "Other Resources",
        links: [
          { label: "Rcpp Slides — Federal Reserve Bank of San Francisco (2017)", url: "https://www.davidzarruk.com/files/Zarruk_Rcpp_FRBSF.pdf" },
        ],
      },
    ],
  },
  {
    title: "La Rama Ciudadana",
    description:
      "Contributing to national debates with relevant data and statistics through scraping tools and data visualization, jointly with Rodrigo Azuero.",
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

const ResourceGroupCard = ({ group }: { group: ResourceGroup }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-border pt-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left text-sm font-medium text-foreground hover:text-accent transition-colors"
      >
        <span>{group.title}</span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ul className="mt-2 space-y-1.5 pl-1">
          {group.links.map((link) => (
            <li key={link.url}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center gap-1.5"
              >
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                </svg>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

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
              className={`group rounded-xl bg-background p-6 border border-border hover:border-accent/40 transition-all hover:shadow-md ${
                project.resources ? "md:col-span-2 lg:col-span-2" : ""
              }`}
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
                  className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline mb-4"
                >
                  {project.link.label}
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </a>
              )}

              {project.resources && (
                <div className="space-y-3 mt-2">
                  {project.resources.map((group) => (
                    <ResourceGroupCard key={group.title} group={group} />
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectsSection;
