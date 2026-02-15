import { motion } from "framer-motion";
import ExpandableGroup, { type ResourceGroup, type ResourceLink } from "./ExpandableGroup";
import { useCardMaterials } from "@/hooks/useCardMaterials";

interface Course {
  title: string;
  institution: string;
  institutionUrl: string;
  period: string;
  description: string;
  cardKey?: string;
  link?: { label: string; url: string };
  resources?: ResourceGroup[];
  otherLinks?: ResourceLink[];
  wide?: boolean;
}

const courses: Course[] = [
  {
    title: "Fiscal Policy and Theory",
    institution: "Universidad de los Andes",
    institutionUrl: "https://uniandes.edu.co/",
    period: "Fall 2021",
    description: "Part of the undergraduate program in Economics.",
    cardKey: "fiscal-policy",
    wide: true,
    resources: [
      {
        title: "Class notes",
        links: [
          ...Array.from({ length: 26 }, (_, i) => ({
            label: `Clase ${i + 1}`,
            url: `https://www.davidzarruk.com/files/fiscal_policy//Fiscal%2020212%20-%20clase%20${i + 1}.pdf`,
          })),
          { label: "Impuestos en Colombia", url: "https://www.davidzarruk.com/files/fiscal_policy//Fiscal%2020212%20-%20Impuestos%20en%20Colombia.pdf" },
          { label: "Regla fiscal en Colombia", url: "https://www.davidzarruk.com/files/fiscal_policy//Fiscal%2020212%20-%20clase%2018,%20Regla%20fiscal%20en%20Colombia.pdf" },
        ],
      },
      {
        title: "Assignments",
        links: [
          { label: "Taller 1", url: "https://www.davidzarruk.com/files/fiscal_policy//Fiscal%2020212%20-%20Taller%201.pdf" },
          { label: "Taller 2", url: "https://www.davidzarruk.com/files/fiscal_policy//Fiscal%2020212%20-%20Taller%202.pdf" },
        ],
      },
    ],
  },
  {
    title: "Advanced Methods for Data Analysis",
    institution: "Universidad de los Andes",
    institutionUrl: "https://uniandes.edu.co/",
    period: "Summer 2021",
    description:
      "Masters in Analytic Intelligence. Topics: time series (ARIMA, Prophet), tree-based models (XGBoost), NLP and neural networks.",
    cardKey: "advanced-methods",
    link: {
      label: "GitHub",
      url: "https://github.com/davidzarruk/AdvancedMethodsDataAnalysisClass",
    },
  },
  {
    title: "Predictive Analytics",
    institution: "Crehana",
    institutionUrl: "https://www.crehana.com/",
    period: "2021 – present",
    description: "Two online courses in predictive analytics.",
    cardKey: "predictive-analytics",
    otherLinks: [
      { label: "Classification models in R", url: "https://www.crehana.com/cursos-online-data/analitica-predictiva-y-modelos-de-clasificacion-en-r/" },
      { label: "Regression models in Python", url: "https://www.crehana.com/cursos-online-data/analitica-predictiva-y-modelos-de-regresion-en-python/" },
    ],
  },
  {
    title: "Economía 5 — Intermediate Macroeconomics",
    institution: "ITAM",
    institutionUrl: "https://www.itam.mx/",
    period: "Summer/Fall 2020, Spring 2021",
    description:
      "Studies the neoclassical growth model. Based on 'Macroeconomía Intermedia' by Alejandro Hernández.",
    cardKey: "economia-5",
    wide: true,
    resources: [
      {
        title: "Class notes",
        links: [
          { label: "Clase 1 — Problema de la firma", url: "https://www.davidzarruk.com/files/economia_5/Clase%201%20-%20Eco%20V%2020202.pdf" },
          { label: "Clase 2 — Problema del consumidor", url: "https://www.davidzarruk.com/files/economia_5/Clase%202%20-%20Eco%20V%2020202.pdf" },
          { label: "Clase 3 — Equilibrio competitivo", url: "https://www.davidzarruk.com/files/economia_5/Clase%203%20-%20Eco%20V%2020202.pdf" },
          { label: "Clase 4 — Equilibrio competitivo", url: "https://www.davidzarruk.com/files/economia_5/Clase%204%20-%20Eco%20V%2020202.pdf" },
          { label: "Clase 5 — Equilibrio competitivo", url: "https://www.davidzarruk.com/files/economia_5/Clase%205%20-%20Eco%20V%2020202.pdf" },
          { label: "Clase 6 — Max. bienestar social", url: "https://www.davidzarruk.com/files/economia_5/Clase%206%20-%20Eco%20V%2020202.pdf" },
          { label: "Clase 7 — Política fiscal (estático)", url: "https://www.davidzarruk.com/files/economia_5/Clase%207%20-%20Eco%20V%2020202.pdf" },
          { label: "Clase 8 — Política fiscal (estático)", url: "https://www.davidzarruk.com/files/economia_5/Clase%208%20-%20Eco%20V%2020202.pdf" },
          { label: "Clase 9 — Política fiscal (estático)", url: "https://www.davidzarruk.com/files/economia_5/Clase%209%20-%20Eco%20V%2020202.pdf" },
          { label: "Clase 10 — Política fiscal (estático)", url: "https://www.davidzarruk.com/files/economia_5/Clase%2010%20-%20Eco%20V%2020202.pdf" },
          { label: "Clase 11 — Política fiscal (estático)", url: "https://www.davidzarruk.com/files/economia_5/Clase%2011%20-%20Eco%20V%2020202.pdf" },
          { label: "Clase 12 — Intercambio intertemporal", url: "https://www.davidzarruk.com/files/economia_5/Clase%2012%20-%20Eco%20V%2020202.pdf" },
          { label: "Clase 13 — Intercambio intertemporal", url: "https://www.davidzarruk.com/files/economia_5/Clase%2013%20-%20Eco%20V%2020202.pdf" },
          { label: "Clase 14 — Intercambio intertemporal", url: "https://www.davidzarruk.com/files/economia_5/Clase%2014%20-%20Eco%20V%2020202.pdf" },
          { label: "Clase 15 — Política fiscal (intercambio)", url: "https://www.davidzarruk.com/files/economia_5/Clase%2015%20-%20Eco%20V%2020202.pdf" },
          { label: "Clase 16 — Equivalencia Ricardiana", url: "https://www.davidzarruk.com/files/economia_5/Clase%2016%20-%20Eco%20V%2020202.pdf" },
          { label: "Clase 17 — Monetaria (intercambio)", url: "https://www.davidzarruk.com/files/economia_5/Clase%2017%20-%20Eco%20V%2020202.pdf" },
          { label: "Clase 18 — Producción intertemporal", url: "https://www.davidzarruk.com/files/economia_5/Clase%2018%20-%20Eco%20V%2020202.pdf" },
          { label: "Clase 19 — Producción intertemporal", url: "https://www.davidzarruk.com/files/economia_5/Clase%2019%20-%20Eco%20V%2020202.pdf" },
          { label: "Clase 20 — Fiscal con producción", url: "https://www.davidzarruk.com/files/economia_5/Clase%2020%20-%20Eco%20V%2020202.pdf" },
          { label: "Clase 21 — Fiscal con producción", url: "https://www.davidzarruk.com/files/economia_5/Clase%2021%20-%20Eco%20V%2020202.pdf" },
          { label: "Clase 22 — Monetaria con producción", url: "https://www.davidzarruk.com/files/economia_5/Clase%2022%20-%20Eco%20V%2020202.pdf" },
          { label: "Clase 23 — Monetaria con producción", url: "https://www.davidzarruk.com/files/economia_5/Clase%2023%20-%20Eco%20V%2020202.pdf" },
          { label: "Clase 24 — Economía abierta (intercambio)", url: "https://www.davidzarruk.com/files/economia_5/Clase%2024%20-%20Eco%20V%2020202.pdf" },
          { label: "Clase 25 — Economía abierta (producción)", url: "https://www.davidzarruk.com/files/economia_5/Clase%2025%20-%20Eco%20V%2020202.pdf" },
          { label: "Clase 26 (1) — Fiscal", url: "https://www.davidzarruk.com/files/economia_5/Clase%2026%20(parte%201)%20-%20Eco%20V%2020202.pdf" },
          { label: "Clase 26 (2) — Fiscal", url: "https://www.davidzarruk.com/files/economia_5/Clase%2026%20(parte%20II)%20-%20Eco%20V%2020202.pdf" },
          { label: "Clase 27 — Equilibrio mundial", url: "https://www.davidzarruk.com/files/economia_5/Clase%2027%20-%20Eco%20V%2020202.pdf" },
          { label: "Clase 28 — Fiscal", url: "https://www.davidzarruk.com/files/economia_5/Clase%2028%20-%20Eco%20V%2020202.pdf" },
          { label: "Clase 29 — Capital", url: "https://www.davidzarruk.com/files/economia_5/Clase%2029%20(parte%20I)%20-%20Eco%20V%2020202.pdf" },
        ],
      },
    ],
  },
  {
    title: "Dynamic Macroeconomics I",
    institution: "ITAM",
    institutionUrl: "https://www.itam.mx/",
    period: "Fall 2018",
    description:
      "Masters level. Modern recursive macroeconomic theory and computational tools. References: Ljungqvist & Sargent, Stokey & Lucas.",
    cardKey: "dynamic-macro",
    wide: true,
    otherLinks: [
      { label: "Syllabus", url: "https://www.davidzarruk.com/files/dynamic_macro_itam_2018/syllabus_rec_macro_18.pdf" },
      { label: "Lecture notes (Nov 12, 2018)", url: "https://www.davidzarruk.com/files/dynamic_macro_itam_2018/class_notes_nov12.pdf" },
    ],
    resources: [
      {
        title: "Exams",
        links: [
          { label: "Midterm", url: "https://www.davidzarruk.com/files/dynamic_macro_itam_2018/Midterm.pdf" },
          { label: "Midterm — solutions", url: "https://www.davidzarruk.com/files/dynamic_macro_itam_2018/Midterm_solution.pdf" },
          { label: "Final", url: "https://www.davidzarruk.com/files/dynamic_macro_itam_2018/Final.pdf" },
          { label: "Final — solutions", url: "https://www.davidzarruk.com/files/dynamic_macro_itam_2018/Final_solution.pdf" },
        ],
      },
      {
        title: "Problem sets",
        links: [
          { label: "Problem set I", url: "https://www.davidzarruk.com/files/dynamic_macro_itam_2018/Problem_set_1.pdf" },
          { label: "Problem set II", url: "https://www.davidzarruk.com/files/dynamic_macro_itam_2018/Problem_set_2.pdf" },
        ],
      },
    ],
  },
  {
    title: "Summer Math Camp (ECON 897)",
    institution: "University of Pennsylvania",
    institutionUrl: "https://www.upenn.edu/",
    period: "2015, 2016",
    description:
      "Two-week course for incoming Econ Ph.D. students on linear algebra, differentiation, and separating hyperplane theorems. References: Rudin, Pugh.",
    cardKey: "math-camp",
    wide: true,
    otherLinks: [
      { label: "Syllabus", url: "https://www.davidzarruk.com/files/Math%20camp/syllabus_math_camp_16.pdf" },
      { label: "Lecture notes (Aug 4, 2016)", url: "https://www.davidzarruk.com/files/Math%20camp/Math_Camp_Notes_080416.pdf" },
    ],
    resources: [
      {
        title: "Exams 2016",
        links: [
          { label: "Exam 1: July 30, 2016", url: "https://www.davidzarruk.com/files/Math%20camp/exam1_2016.pdf" },
          { label: "Exam 1 — solutions", url: "https://www.davidzarruk.com/files/Math%20camp/exam1_2016_soln.pdf" },
          { label: "Exam 2: August 5, 2016", url: "https://www.davidzarruk.com/files/Math%20camp/exam2_2016.pdf" },
          { label: "Exam 2 — solutions", url: "https://www.davidzarruk.com/files/Math%20camp/exam2_2016_soln.pdf" },
          { label: "Final: August 22, 2016", url: "https://www.davidzarruk.com/files/Math%20camp/final_2016.pdf" },
        ],
      },
      {
        title: "Exams 2015",
        links: [
          { label: "Exam 1: July 31, 2015", url: "https://www.davidzarruk.com/files/Math%20camp/exam1_2015.pdf" },
          { label: "Exam 1 — solutions", url: "https://www.davidzarruk.com/files/Math%20camp/exam1_2015_soln.pdf" },
          { label: "Exam 2: August 7, 2015", url: "https://www.davidzarruk.com/files/Math%20camp/exam2_2015.pdf" },
          { label: "Exam 2 — solutions", url: "https://www.davidzarruk.com/files/Math%20camp/exam2_2015_soln.pdf" },
          { label: "Final: August 24, 2015", url: "https://www.davidzarruk.com/files/Math%20camp/final_2015.pdf" },
        ],
      },
    ],
  },
  {
    title: "MATLAB Workshop (ECON 1303)",
    institution: "Universidad de los Andes",
    institutionUrl: "https://uniandes.edu.co/",
    period: "2013",
    description:
      "Introductory course for Economics students, aimed at preparing students to estimate and calibrate Economic models. Joint with Nicolás Idrobo.",
    cardKey: "matlab-workshop",
    link: {
      label: "Syllabus",
      url: "https://economia.uniandes.edu.co/assets/archivos/Programas_Academicos/Pregrado/TallerdeMatlab_NicolasIdrobo_201310.pdf",
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
  const { getMaterialsByCard } = useCardMaterials();

  const getEffectiveResources = (course: Course): ResourceGroup[] | undefined => {
    if (!course.cardKey) return course.resources;
    const uploadedLinks = getMaterialsByCard(course.cardKey);
    if (uploadedLinks.length > 0) {
      // Replace hardcoded resources with uploaded files
      return [{ title: "Files", links: uploadedLinks }];
    }
    return course.resources;
  };

  return (
    <section id="teaching" className="py-24 px-6 bg-secondary/40">
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
          className="grid gap-6 md:grid-cols-3"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {courses.map((course) => {
            const effectiveResources = getEffectiveResources(course);
            return (
              <motion.div
                key={course.title}
                variants={item}
                className="group rounded-xl bg-card p-6 border border-border hover:border-accent/40 transition-colors"
              >
                <h3 className="font-heading text-lg text-foreground leading-snug mb-1">
                  {course.title}
                </h3>
                <p className="text-sm font-medium mb-0.5">
                  <a href={course.institutionUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                    {course.institution}
                  </a>
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
                    className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline mb-4"
                  >
                    {course.link.label}
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M7 17L17 7M17 7H7M17 7v10" />
                    </svg>
                  </a>
                )}

                {course.otherLinks && course.otherLinks.length > 0 && (
                  <div className="mb-2">
                    <ul className="space-y-1.5 pl-1">
                      {course.otherLinks.map((ol) => (
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

                {effectiveResources && (
                  <div className="space-y-3 mt-2">
                    {effectiveResources.map((group) => (
                      <ExpandableGroup key={group.title} group={group} />
                    ))}
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

export default TeachingSection;
