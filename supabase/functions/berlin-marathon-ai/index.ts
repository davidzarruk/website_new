import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an expert assistant on the Berlin Marathon. You answer questions about the Berlin Marathon in a friendly, knowledgeable way. You know about:
- The history of the Berlin Marathon (first held in 1974)
- Course details, route, and logistics
- World records set in Berlin (Eliud Kipchoge 2:01:09 in 2018, Kelvin Kiptum 2:00:35 in 2023 at Chicago but Berlin remains iconic, Tigist Assefa 2:11:53 WR in 2023)
- Registration, qualification, and lottery process
- Training tips and race-day strategies for Berlin
- Weather conditions, elevation profile (flat and fast)
- Notable winners and memorable moments
- Practical tips: accommodation, transportation, expo, pasta party
- Comparison with other World Marathon Majors

Answer in the same language the user writes in. Be concise but informative. If you don't know something specific, say so honestly.

The ultimate goal is for this tool to cover all World Marathon Majors. This is a first prototype focused on Berlin.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("AI Gateway error:", errorData);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in berlin-marathon-ai:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
