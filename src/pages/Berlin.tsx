import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/external-supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const Berlin = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("berlin-marathon-ai", {
        body: { messages: newMessages },
      });

      if (error) throw error;

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      console.error("Error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-3xl flex items-center justify-between px-6 py-4">
          <div>
            <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back
            </a>
          </div>
          <h1 className="font-heading text-xl text-foreground">Berlin Marathon AI</h1>
          <div className="w-12" />
        </div>
      </header>

      {/* Chat area */}
      <main className="flex-1 mx-auto max-w-3xl w-full px-6 py-8 flex flex-col">
        {messages.length === 0 ? (
          <motion.div
            className="flex-1 flex flex-col items-center justify-center text-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-5xl">🏃‍♂️</div>
            <h2 className="font-heading text-2xl md:text-3xl text-foreground">
              Ask anything about the Berlin Marathon
            </h2>
            <p className="text-muted-foreground max-w-md">
              Course details, records, registration, training tips, logistics — I'm here to help.
            </p>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {[
                "What's the course like?",
                "How do I register?",
                "What's the marathon world record?",
                "Best training plan for Berlin?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-accent/40 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 space-y-6 mb-6 overflow-y-auto">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-accent text-accent-foreground rounded-br-md"
                      : "bg-card border border-border text-foreground rounded-bl-md"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </motion.div>
            ))}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-card border border-border rounded-2xl rounded-bl-md px-5 py-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="sticky bottom-0 pb-4">
          <div className="flex gap-3 items-center bg-card border border-border rounded-xl p-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the Berlin Marathon..."
              className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3 max-w-lg mx-auto">
            Disclaimer: This is a prototype. Responses are AI-generated and may contain inaccuracies. The goal is to eventually cover all World Marathon Majors.
          </p>
        </form>
      </main>
    </div>
  );
};

export default Berlin;
