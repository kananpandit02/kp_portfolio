import { Langfuse } from "langfuse";

// ===== Langfuse Init (SAFE, non-blocking) =====
const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.LANGFUSE_BASE_URL || "https://cloud.langfuse.com"
});

// ===== Personalized RAG Data =====
const resumeContext = `
Kanan Pandit is an AI/ML Engineer and MSc student in Big Data Analytics.
Skills include Machine Learning, Deep Learning, Computer Vision,
Natural Language Processing, and Distributed Systems.
Tools: PyTorch, Apache Spark, H2O, HuggingFace, OpenCV.
Projects include Graph RAG systems, Distributed ML pipelines,
and healthcare AI for ICU monitoring.
`;

const portfolioContext = `
This portfolio showcases Kanan Pandit's academic and project journey
in AI, data science, and scalable distributed systems.
`;

// ===== Agent Router =====
function routeQuery(message) {
  const q = message.toLowerCase();

  if (
    q.includes("skill") ||
    q.includes("education") ||
    q.includes("experience")
  ) return "RESUME";

  if (
    q.includes("project") ||
    q.includes("portfolio")
  ) return "PORTFOLIO";

  if (
    q.includes("food") ||
    q.includes("family") ||
    q.includes("personal")
  ) return "REFUSE";

  return "GENERAL";
}

// ===== Prompt Builder =====
function buildPrompt(route, message) {
  if (route === "REFUSE") {
    return `
I only answer professional questions about Kanan Pandit.
If the information is not available, politely say so.
`;
  }

  const context =
    route === "RESUME" ? resumeContext :
    route === "PORTFOLIO" ? portfolioContext :
    "";

  return `
You are an AI assistant created by Kanan Pandit.

Rules:
- Answer ONLY using the provided context.
- Do NOT guess or hallucinate.
- If the answer is not present, say "I don't have that information."

Context:
${context}

Question:
${message}
`;
}

// ===== Netlify Function Handler =====
export async function handler(event) {
  try {
    const body = JSON.parse(event.body || "{}");
    const message = body.message;

    if (!message) {
      return {
        statusCode: 200,
        body: JSON.stringify({ reply: "No message provided." })
      };
    }

    const route = routeQuery(message);
    const prompt = buildPrompt(route, message);

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://kananpanditportfolio.netlify.app",
          "X-Title": "Kanan Pandit Portfolio AI"
        },
        body: JSON.stringify({
          model: "arcee-ai/trinity-large-preview:free",
          messages: [
            {
              role: "system",
              content: "You are a professional AI assistant for Kanan Pandit."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.4,
          max_tokens: 400
        })
      }
    );

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content
      || "⚠️ AI responded with no text. Try again.";

    // ===== Langfuse Logging (NON-BLOCKING) =====
    try {
      await langfuse.trace({
        name: "portfolio-chat",
        input: message,
        output: reply,
        metadata: {
          route,
          model: "arcee-ai/trinity-large-preview:free"
        }
      });
    } catch (e) {
      console.error("Langfuse error:", e.message);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        reply: "Server error: " + err.message
      })
    };
  }
}
