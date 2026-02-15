import { motion } from "framer-motion";
import profileImg from "@/assets/davidzarruk.jpg";

const Hero = () => {
  return (
    <section
      id="about"
      className="min-h-screen flex items-center justify-center px-6 pt-20"
    >
      <div className="mx-auto max-w-5xl w-full grid md:grid-cols-5 gap-12 items-center">
        {/* Photo */}
        <motion.div
          className="md:col-span-2 flex justify-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="relative">
            <div className="absolute -inset-3 rounded-2xl bg-accent/10 blur-xl" />
            <img
              src={profileImg}
              alt="David Zarruk"
              className="relative w-64 h-64 md:w-72 md:h-72 object-cover rounded-2xl shadow-lg"
            />
          </div>
        </motion.div>

        {/* Text */}
        <motion.div
          className="md:col-span-3 space-y-6"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
        >
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight">
            David Zarruk
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
            Senior Economist at{" "}
            <a href="https://www.amazon.com/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              Amazon
            </a>
            , where I work on causal ML systems for inventory optimization across 20+ countries. Economist and mathematician with a Ph.D. from the{" "}
            <a href="https://www.upenn.edu/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              University of Pennsylvania
            </a>
            , specializing in causal inference and machine learning at scale.
          </p>
          <p className="text-muted-foreground leading-relaxed max-w-lg">
            Previously, VP of Data Science at{" "}
            <a href="https://www.rappibank.com/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              RappiBank
            </a>{" "}
            and Assistant Professor of Economics at{" "}
            <a href="https://www.itam.mx/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              ITAM
            </a>
            . I also teach at{" "}
            <a href="https://uniandes.edu.co/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              Universidad de los Andes
            </a>{" "}
            in Colombia.
          </p>
          <p className="text-muted-foreground leading-relaxed max-w-lg">
            Marathon runner (2:44 PR) and creator of{" "}
            <a href="https://www.instagram.com/datarunnerco/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              @datarunnerco
            </a>
            , where I share about data science and endurance sports.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            {["Machine Learning", "Causal Inference", "High-Performance Computing"].map(
              (tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground"
                >
                  {tag}
                </span>
              )
            )}
          </div>

          {/* Social links */}
          <div className="flex items-center gap-5 pt-2">
            <a href="mailto:davidzarruk@gmail.com" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Email">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4L12 13 2 4"/></svg>
            </a>
            <a href="https://github.com/davidzarruk" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="GitHub">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.08 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0112 5.8c1.02.01 2.05.14 3.01.4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.82.58A12.01 12.01 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
            <a href="https://www.linkedin.com/in/davidzarruk/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="LinkedIn">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 11-.01-4.12 2.06 2.06 0 01.01 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.23 0z"/></svg>
            </a>
            <a href="https://www.instagram.com/davidzarruk/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Instagram">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
