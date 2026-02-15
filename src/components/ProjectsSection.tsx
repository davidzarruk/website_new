import { motion } from "framer-motion";
import ExpandableGroup, { type ResourceGroup, type ResourceLink } from "./ExpandableGroup";
import { useCardMaterials } from "@/hooks/useCardMaterials";

interface Project {
  title: string;
  description: string;
  tags: string[];
  cardKey?: string;
  link?: { label: string; url: string };
  resources?: ResourceGroup[];
  coauthors?: {
    text: string;
    authors: { name: string; url: string }[];
  };
  otherLinks?: ResourceLink[];
  wide?: boolean;
}

const projects: Project[] = [
  {
    title: "Notes on Computational Methods for Economists",
    description: "Notes on high-performance computing applied to Economics, specifically on parallel and GPU computing applied to structural models.",
    wide: true,
    cardKey: "computational-methods",
    coauthors: {
      text: "with",
      authors: [
        { name: "Jesús Fernández-Villaverde", url: "https://www.sas.upenn.edu/~jesusfv/" },
        { name: "Pablo Guerrón-Quintana", url: "https://sites.google.com/site/pabloaguerronquintana/" },
      ],
    },
    tags: ["CUDA", "MPI", "Julia", "C++"],
    link: {
      label: "GitHub Repository",
      url: "https://github.com/davidzarruk/Parallel_Computing",
    },
    resources: [
      {
        title: "Slides",
        subgroups: [
          {
            title: "High-performance computing in Economics",
            links: [
              { label: "High-performance computing in Economics", url: "https://www.davidzarruk.com/files/Computation/Lecture_HPC_1_HPC_Economics.pdf" },
              { label: "Software engineering", url: "https://www.davidzarruk.com/files/Computation/Lecture_HPC_2_Software_Engineering.pdf" },
              { label: "OS and basic utilities", url: "https://www.davidzarruk.com/files/Computation/Lecture_HPC_3_OS_Basic_Utilities.pdf" },
              { label: "Concepts on programming languages", url: "https://www.davidzarruk.com/files/Computation/Lecture_HPC_4_Programming_Languages_Concepts.pdf" },
              { label: "Scientific computing languages", url: "https://www.davidzarruk.com/files/Computation/Lecture_HPC_5_Scientific_Computing_Languages.pdf" },
              { label: "Coding tools", url: "https://www.davidzarruk.com/files/Computation/Lecture_HPC_6_Coding_Tools.pdf" },
              { label: "Programming paradigms", url: "https://www.davidzarruk.com/files/Computation/Lecture_HPC_7_Programming_Paradigms.pdf" },
              { label: "The elements of programming style", url: "https://www.davidzarruk.com/files/Computation/Lecture_HPC_8_Elements_Programming_Style.pdf" },
              { label: "Data handling", url: "https://www.davidzarruk.com/files/Computation/Lecture_HPC_9_Data_Handling.pdf" },
              { label: "Web scraping", url: "https://www.davidzarruk.com/files/Computation/Lecture_HPC_10_Web_Scrapping.pdf" },
              { label: "Parallel programming", url: "https://www.davidzarruk.com/files/Computation/Lecture_HPC_11_Parallelization.pdf" },
            ],
          },
          {
            title: "Perturbation",
            links: [
              { label: "Perturbation methods I: basic results", url: "https://www.davidzarruk.com/files/Computation/Lecture_SM_5_Perturbation_I.pdf" },
              { label: "Perturbation methods II: general case", url: "https://www.davidzarruk.com/files/Computation/Lecture_SM_6_Perturbation_II.pdf" },
              { label: "Perturbation methods III: change of variables", url: "https://www.davidzarruk.com/files/Computation/Lecture_SM_7_Perturbation_III.pdf" },
              { label: "Perturbation methods IV: perturbing the value function", url: "https://www.davidzarruk.com/files/Computation/Lecture_SM_8_Perturbation_IV.pdf" },
              { label: "Perturbation methods V: pruning", url: "https://www.davidzarruk.com/files/Computation/Lecture_SM_9_Perturbation_V.pdf" },
            ],
          },
        ],
      },
      {
        title: "Other",
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
    cardKey: "la-rama-ciudadana",
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
    cardKey: "gmapsdistance",
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
    cardKey: "rtauchen",
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
    cardKey: "berlin-marathon-ai",
    link: {
      label: "Try it",
      url: "/berlin",
    },
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

const ProjectsSection = () => {
  const { getMaterialsByCard } = useCardMaterials();

  const getEffectiveResources = (project: Project): ResourceGroup[] | undefined => {
    if (!project.cardKey) return project.resources;
    const uploadedLinks = getMaterialsByCard(project.cardKey);
    if (uploadedLinks.length > 0) {
      return [{ title: "Files", links: uploadedLinks }];
    }
    return project.resources;
  };

  return (
    <section id="projects" className="py-24 px-6">
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
          className="grid gap-6 md:grid-cols-3"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {projects.map((project) => {
            const effectiveResources = getEffectiveResources(project);
            return (
              <motion.div
                key={project.title}
                variants={itemVariant}
                className="group rounded-xl bg-card p-6 border border-border hover:border-accent/40 transition-colors"
              >
                <h3 className="font-heading text-lg text-foreground mb-1">
                  {project.title}
                </h3>
                {project.coauthors && (
                  <p className="text-sm text-muted-foreground mb-3">
                    ({project.coauthors.text}{" "}
                    {project.coauthors.authors.map((a, i) => (
                      <span key={a.name}>
                        <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{a.name}</a>
                        {i < project.coauthors!.authors.length - 1 ? " and " : ""}
                      </span>
                    ))})
                  </p>
                )}
                {project.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {project.description}
                  </p>
                )}
                {project.tags && project.tags.length > 0 && (
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
                )}
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

                {effectiveResources && (
                  <div className="space-y-3 mt-2">
                    {effectiveResources.map((group) => (
                      <ExpandableGroup key={group.title} group={group} />
                    ))}
                  </div>
                )}

                {project.otherLinks && project.otherLinks.length > 0 && (
                  <div className="border-t border-border pt-3 mt-3">
                    <p className="text-sm font-medium text-foreground mb-2">Other:</p>
                    <ul className="space-y-1.5 pl-1">
                      {project.otherLinks.map((ol) => (
                        <li key={ol.url}>
                          <a href={ol.url} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center gap-1.5">
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                              <polyline points="14,2 14,8 20,8" />
                            </svg>
                            {ol.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectsSection;
