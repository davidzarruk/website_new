import { motion } from "framer-motion";

interface Course {
  title: string;
  institution: string;
  period: string;
  description: string;
  link?: { label: string; url: string };
}

const courses: Course[] = [
  {
    title: "Fiscal Policy and Theory",
    institution: "Universidad de los Andes",
    period: "Fall 2021",
    description:
      "Part of the undergraduate program in Economics. Covers fiscal policy theory with 26 lectures.",
    link: {
      label: "Syllabus",
      url: "https://www.davidzarruk.com/files/fiscal_policy/Programa%20Fiscal%202021-2.pdf",
    },
  },
  {
    title: "Advanced Methods for Data Analysis",
    institution: "Universidad de los Andes",
    period: "Summer 2021",
    description:
      "Masters in Analytic Intelligence. Topics: time series (ARIMA, Prophet), tree-based models (XGBoost), NLP and neural networks.",
    link: {
      label: "GitHub",
      url: "https://github.com/davidzarruk/AdvancedMethodsDataAnalysisClass",
    },
  },
  {
    title: "Predictive Analytics",
    institution: "Crehana",
    period: "2021 – present",
    description:
      "Two online courses: Classification models in R and Regression models in Python.",
    link: {
      label: "View courses",
      url: "https://www.crehana.com/cursos-online-data/analitica-predictiva-y-modelos-de-clasificacion-en-r/",
    },
  },
  {
    title: "Economía 5 — Intermediate Macroeconomics",
    institution: "ITAM",
    period: "2020 – 2021",
    description:
      "Studies the neoclassical growth model. Based on 'Macroeconomía Intermedia' by Alejandro Hernández.",
    link: {
      label: "Syllabus",
      url: "https://www.davidzarruk.com/files/economia_5/Temario%20EcoV%20O20.pdf",
    },
  },
  {
    title: "Dynamic Macroeconomics I",
    institution: "ITAM",
    period: "Fall 2018",
    description:
      "Masters level. Modern recursive macroeconomic theory and computational tools. References: Ljungqvist & Sargent, Stokey & Lucas.",
    link: {
      label: "Syllabus",
      url: "https://www.davidzarruk.com/files/dynamic_macro_itam_2018/syllabus_rec_macro_18.pdf",
    },
  },
  {
    title: "Summer Math Camp (ECON 897)",
    institution: "University of Pennsylvania",
    period: "2015, 2016",
    description:
      "Two-week course for incoming Econ Ph.D. students on linear algebra, differentiation, and separating hyperplane theorems.",
    link: {
      label: "Lecture Notes",
      url: "https://www.davidzarruk.com/files/Math%20camp/Math_Camp_Notes_080416.pdf",
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

const TeachingSection = () => {
  return (
    <section id="teaching" className="py-24 px-6">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          className="font-heading text-3xl md:text-4xl text-foreground mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Teaching
        </motion.h2>

        <motion.div
          className="grid gap-6 md:grid-cols-2"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {courses.map((course) => (
            <motion.div
              key={course.title}
              variants={item}
              className="group rounded-xl bg-card p-6 border border-border hover:border-accent/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="font-heading text-lg text-foreground leading-snug">
                  {course.title}
                </h3>
              </div>
              <p className="text-sm text-accent font-medium mb-1">
                {course.institution}
              </p>
              <p className="text-xs text-muted-foreground mb-3">{course.period}</p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {course.description}
              </p>
              {course.link && (
                <a
                  href={course.link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
                >
                  {course.link.label}
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

export default TeachingSection;
