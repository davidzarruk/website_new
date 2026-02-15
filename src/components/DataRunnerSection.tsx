import { motion } from "framer-motion";

const instagramPosts = [
  "https://www.instagram.com/p/DD-GoKoJise/",
  "https://www.instagram.com/p/DCh_wS_JHQL/",
  "https://www.instagram.com/p/DIxFz6qpDA_/",
];

const raceResults = [
  { race: "Maratón de Chicago", year: "2024", time: "2:44:53", location: "Chicago, USA" },
  { race: "Media Maratón de Bogotá", year: "2024", time: "1:20:26", location: "Bogotá, Colombia" },
  { race: "Maratón de Nueva York", year: "2023", time: "2:53:20", location: "New York, USA" },
  { race: "Media Maratón de Nueva York", year: "2022", time: "1:18:07", location: "New York, USA" },
  { race: "Maratón de Berlín", year: "2021", time: "3:03:27", location: "Berlin, Germany" },
];

const DataRunnerSection = () => {
  return (
    <section id="datarunner" className="py-24 px-6">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-10">
            DataRunner
          </h2>
        </motion.div>

        {/* Instagram Feed */}
        <motion.div
          className="grid md:grid-cols-3 gap-6 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {instagramPosts.map((url, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              <iframe
                src={`${url}embed`}
                className="w-full h-[480px] border-0"
                allowTransparency
                scrolling="no"
                title={`Instagram post ${i + 1}`}
              />
            </div>
          ))}
        </motion.div>

        {/* Berlin Marathon AI Card */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <a
            href="/berlin"
            className="group block rounded-xl border border-border bg-card p-6 hover:border-accent/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-3xl">🏃‍♂️</span>
                <div>
                  <h3 className="font-heading text-lg text-foreground group-hover:text-accent transition-colors">
                    Berlin Marathon AI
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Ask anything about the Berlin Marathon — powered by AI
                  </p>
                </div>
              </div>
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                className="text-muted-foreground group-hover:text-accent transition-colors"
              >
                <path d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </div>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="font-heading text-2xl text-foreground mb-6">Race Results</h3>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-muted-foreground">Race</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Year</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Time</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {raceResults.map((race, i) => (
                    <tr
                      key={i}
                      className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-4 font-medium text-foreground">{race.race}</td>
                      <td className="p-4 text-muted-foreground">{race.year}</td>
                      <td className="p-4 text-accent font-medium">{race.time}</td>
                      <td className="p-4 text-muted-foreground hidden sm:table-cell">{race.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <a
            href="https://www.instagram.com/datarunnerco/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground hover:bg-accent/90 transition-colors"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
            </svg>
            Follow @datarunnerco
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default DataRunnerSection;
