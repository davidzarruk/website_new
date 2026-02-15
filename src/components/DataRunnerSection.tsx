import { motion } from "framer-motion";

const instagramPosts = [
  "https://www.instagram.com/p/DD-GoKoJise/",
  "https://www.instagram.com/p/DCh_wS_JHQL/",
  "https://www.instagram.com/p/DIxFz6qpDA_/",
];

const stats = [
  { label: "Marathons", value: "5" },
  { label: "Half Marathons", value: "8" },
  { label: "Countries Raced", value: "4" },
  { label: "Total km", value: "3,200+" },
];

const raceResults = [
  { race: "Berlin Marathon", year: "2024", time: "3:45:12", location: "Berlin, Germany" },
  { race: "Bogotá Half Marathon", year: "2024", time: "1:38:45", location: "Bogotá, Colombia" },
  { race: "Chicago Marathon", year: "2023", time: "3:52:30", location: "Chicago, USA" },
  { race: "Mexico City Marathon", year: "2022", time: "3:58:10", location: "Mexico City, Mexico" },
  { race: "Medellín Half Marathon", year: "2022", time: "1:42:20", location: "Medellín, Colombia" },
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

        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-6 text-center"
            >
              <p className="font-heading text-3xl text-accent mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Race Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
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
          transition={{ duration: 0.6, delay: 0.4 }}
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
