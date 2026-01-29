import { Langfuse } from "langfuse";

/* ================= LANGFUSE INIT ================= */
const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.LANGFUSE_HOST || "https://us.cloud.langfuse.com"
});

/* ================= RESUME CONTEXT (PDF MATCHED) ================= */
const resumeContext = `
Kanan Pandit is an AI/ML Engineer at Rezolve AI (Jan 2026 – Present)
and an MSc student in Big Data Analytics at
Ramakrishna Mission Vivekananda Educational and Research Institute (RKMVERI),
Belur Math, West Bengal, India.

Education:
- M.Sc in Big Data Analytics, RKMVERI (2024 – Present), CGPA: 7.26 (Till Sem-1)
- B.Ed with Pedagogy of Mathematics, WBUTTEPA (2020 – 2022), CGPA: 9.75
- B.Sc in Mathematics, Vidyasagar University (2017 – 2020), CGPA: 6.85

Experience:
- AI/ML Engineer at Rezolve AI (Jan 2026 – Present)
  Working on machine learning and AI systems with a focus on
  data-driven modeling and intelligent applications.

Technical Skills:
- Programming Languages: Python, R, LaTeX
- Libraries & Frameworks: PyTorch, OpenCV, scikit-learn, Seaborn,
  PySpark, Neo4j, H2O, Ray, NumPy, Pandas, Matplotlib
- Tools & Platforms: Git, GitHub, Jupyter Notebook, Google Colab,
  VS Code, Streamlit, MySQL
- Operating Systems: Windows, Linux (Ubuntu)
`;

/* ================= PROJECT / PORTFOLIO CONTEXT ================= */
const portfolioContext = `
Kanan Pandit has completed the following academic and applied AI projects:

1. GraphRAG-Based Multi-Document Question Answering System (Aug 2025)
   - Implemented a multi-stage GraphRAG pipeline using BM25,
     FAISS dense retrieval, and Neo4j knowledge graphs.
   - Designed entity-aware retrieval and citation-grounded
     LLM responses to reduce hallucination.

2. Wildfire Confidence Prediction using H2O Distributed Random Forest
   (Jan 2025 – May 2025)
   - Deployed a two-machine H2O cluster.
   - Trained distributed Random Forest models for
     multiclass wildfire confidence prediction.
   - Performed feature engineering and statistical analysis.

3. Artistic Image Transformation in Ghibli Aesthetic (Jan 2025 – May 2025)
   - Built a CycleGAN for unpaired image-to-image translation.
   - Converted real-world images into Studio Ghibli-style artwork.
   - Deployed the system using Streamlit.

4. Smart Control Hub using Hand Gestures (Jan 2025 – May 2025)
   - Developed a gesture-based virtual controller using OpenCV and Mediapipe.
   - Enabled real-time control of volume, brightness, mouse, and slides.

5. Comparative Study of Classification Algorithms on the EMNIST Dataset
   (Sep 2024 – Nov 2024)
   - Compared multiple ML classifiers for 62-class handwritten
     character recognition.
   - Identified class imbalance and scalability challenges.
`;

/* ================= AGENT ROUTER ================= */
function routeQuery(message) {
  const q = message.toLowerCase();

  if (q.includes("project") || q.includes("portfolio"))
    return "PORTFOLIO";

  if (
    q.includes("skill") ||
    q.includes("education") ||
    q.includes("experience") ||
    q.includes("who is") ||
    q.includes("about")
  )
    return "RESUME";

  if (
    q.includes("food") ||
    q.includes("family") ||
    q.includes("personal")
  )
    return "REFUSE";

  return "GENERAL";
}

/* ================= SYSTEM PROMPT ================= */
function buildSystemPrompt(route) {
  return `
You are the OFFICIAL AI assistant created by Kanan Pandit.

STRICT RULES:
- Answer ONLY using the provided context.
- Do NOT use outside knowledge.
- Do NOT guess or hallucinate.
- If the information is not present, say:
  "That information is not available in this portfolio."

CONTEXT:
${resumeContext}
${route === "PORTFOLIO" ? portfolioContext : ""}
`;
}

/* ================= NETLIFY FUNCTION ================= */
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
          max_tokens: 400
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
