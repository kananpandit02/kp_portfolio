import { Langfuse } from "langfuse";

/* ================= Langfuse Init ================= */
const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.LANGFUSE_HOST || "https://us.cloud.langfuse.com"
});

/* ================= RAG CONTEXT ================= */
const resumeContext = `
Kanan Pandit is an AI/ML Engineer and MSc student in Big Data Analytics.
He specializes in Machine Learning, Deep Learning, Computer Vision,
Natural Language Processing, and Distributed Systems.

Tools: PyTorch, Apache Spark, H2O, HuggingFace, OpenCV.
Projects: Graph RAG systems, Distributed ML pipelines,
Healthcare AI for ICU monitoring.
`;

const portfolioContext = `
This portfolio represents Kanan Pandit's academic, research,
and project journey in AI, data science, and scalable systems.
`;

/* ================= AGENT ROUTER ================= */
function routeQuery(message) {
  const q = message.toLowerCase();

  if (q.includes("skill") || q.includes("education") || q.includes("experience"))
    return "RESUME";

  if (q.includes("project") || q.includes("portfolio"))
    return "PORTFOLIO";

  if (q.includes("food") || q.includes("family"))
    return "REFUSE";

  // IMPORTANT: who / about / intro should map to RESUME
  if (q.includes("who is") || q.includes("about"))
    return "RESUME";

  return "GENERAL";
}

/* ================= SYSTEM PROMPT ================= */
function buildSystemPrompt(route) {
  return `
You are the OFFICIAL AI assistant of Kanan Pandit.

STRICT RULES:
- Answer ONLY using the provided context.
- Do NOT use outside knowledge.
- Do NOT guess or hallucinate.
- If information is not present, say:
  "That information is not available in this portfolio."

CONTEXT:
${resumeContext}
${route === "PORTFOLIO" ? portfolioContext : ""}
`;
}

/* ================= NETLIFY HANDLER ================= */
export async function handler(event) {
  let trace;

  try {
    const body = JSON.parse(event.body || "{}");
    const message = body.message?.trim();

    if (!message) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          reply: "Please ask a question about Kanan Pandit."
        })
      };
    }

    const route = routeQuery(message);
    const systemPrompt = buildSystemPrompt(route);

    trace = langfuse.trace({
      name: "portfolio-chat",
      input: message,
      metadata: { route }
    });

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://kananpanditportfolio.netlify.app",
          "X-Title": "Kanan Pandit Portfolio AI"
        },
        body: JSON.stringify({
          model: "arcee-ai/trinity-large-preview:free",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ],
          temperature: 0.2,
          max_tokens: 350
        })
      }
    );

    const data = await response.json();
    const reply =
      data?.choices?.[0]?.message?.content ||
      "That information is not available in this portfolio.";

    trace.generation({
      name: "llm-response",
      output: reply,
      model: "arcee-ai/trinity-large-preview:free"
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };

  } catch (err) {
    if (trace) trace.error({ message: err.message });

    return {
      statusCode: 500,
      body: JSON.stringify({
        reply: "Server error. Please try again."
      })
    };
  } finally {
    await langfuse.flush();
  }
}
