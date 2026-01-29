import { Langfuse } from "langfuse";

/* ================= LANGFUSE INIT ================= */
const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.LANGFUSE_BASE_URL
});

/* ================= COMPLETE KNOWLEDGE CONTEXT ================= */
const fullContext = `
IDENTITY
Name: Kanan Pandit
Location: West Bengal, India

CONTACT
Email: kananpandit02@gmail.com
GitHub: https://github.com/kananpandit02
LinkedIn: https://www.linkedin.com/in/kanan-pandit
Mobile:7384661310

PROFESSIONAL SUMMARY
Kanan Pandit is an AI/ML Engineer at Rezolve AI (Jan 2026 – Present).
He is also pursuing an M.Sc in Big Data Analytics.
His core focus is building production-grade AI, machine learning,
and distributed systems for real-world applications.

EDUCATION
- M.Sc in Big Data Analytics (2024 – Present) ,CGPA: 9.75 till sem 1
  Ramakrishna Mission Vivekananda Educational and Research Institute (RKMVERI),
  Belur Math, West Bengal
- B.Ed in Mathematics (2020 – 2022), CGPA: 9.75
  WBUTTEPA
- B.Sc in Mathematics (2017 – 2020)
  Vidyasagar University

PROFESSIONAL EXPERIENCE
AI/ML Engineer — Rezolve AI (Jan 2026 – Present)
- Designing and implementing ML pipelines
- Working on intelligent AI-driven systems
- Applying data-driven modeling in production environments

TECHNICAL SKILLS
- Programming: Python, R, LaTeX
- Machine Learning: Supervised & Unsupervised Learning
- Deep Learning: CNNs, Neural Networks, Transformers
- NLP: Text processing, embeddings, LLM applications
- Computer Vision: OpenCV, MediaPipe
- Big Data & Distributed Systems: Apache Spark, PySpark, H2O, Ray
- Libraries & Tools: PyTorch, scikit-learn, NumPy, Pandas,
  Matplotlib, Seaborn
- Databases & Graph: MySQL, Neo4j
- Platforms & OS: Linux (Ubuntu), Git, GitHub,
  Jupyter Notebook, Google Colab, VS Code, Streamlit

PROJECTS
1. GraphRAG-Based Multi-Document Question Answering System
   - Combined BM25, FAISS dense retrieval, and Neo4j graphs
   - Reduced hallucination using entity-aware retrieval

2. Distributed Wildfire Confidence Prediction
   - Built a two-node H2O cluster
   - Trained distributed Random Forest models

3. Gesture-Based Smart Control Hub
   - Used OpenCV and MediaPipe
   - Controlled system volume, brightness, mouse, and slides

4. Ghibli-Style Image Transformation
   - Built a CycleGAN for unpaired image-to-image translation
   - Deployed using Streamlit

5. EMNIST Handwritten Character Classification
   - Compared multiple ML classifiers
   - Studied class imbalance and scalability

CERTIFICATIONS & COURSEWORK
- Machine Learning
- Deep Learning
- Big Data Analytics
- Distributed Computing
- Computer Vision
- Natural Language Processing

INTERESTS & HOBBIES
- Reading and experimenting with AI research papers
- Building real-world ML systems
- Distributed systems and scalable AI
- Teaching mathematics and AI concepts

IMPORTANT NOTES
- This assistant answers ONLY based on this context
- It must not invent or assume information
`;

/* ================= SMART QUERY ROUTER ================= */
function routeQuery(message) {
  const q = message.toLowerCase();

  if (
    q.includes("project") ||
    q.includes("work") ||
    q.includes("portfolio") ||
    q.includes("build") ||
    q.includes("research")
  ) return "PROJECT";

  if (
    q.includes("skill") ||
    q.includes("education") ||
    q.includes("experience") ||
    q.includes("background") ||
    q.includes("who") ||
    q.includes("about")
  ) return "PROFILE";

  if (
    q.includes("contact") ||
    q.includes("email") ||
    q.includes("phone") ||
    q.includes("mobile") ||
    q.includes("linkedin") ||
    q.includes("github")
  ) return "CONTACT";

  if (
    q.includes("food") ||
    q.includes("family") ||
    q.includes("age") ||
    q.includes("married") ||
    q.includes("religion") ||
    q.includes("salary")
  ) return "REFUSE";

  return "GENERAL";
}

/* ================= SYSTEM PROMPT ================= */
function buildSystemPrompt(route, message) {
  if (route === "REFUSE") {
    return `
You are Kanan Pandit's professional AI assistant.

Respond politely and naturally.
Explain that personal or private information
is not part of the public portfolio,
and guide the user toward professional topics
like skills, projects, education, or experience.
`;
  }

  return `
You are the OFFICIAL AI assistant created by Kanan Pandit.

RULES:
- Answer ONLY using the context below
- Handle spelling mistakes and casual language naturally
- Do NOT hallucinate or use outside knowledge
- If something is missing, respond politely and dynamically
  (do not repeat the same sentence every time)

CONTEXT:
${fullContext}

USER QUESTION:
${message}
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
          reply:
            "Hi 👋 You can ask me about Kanan Pandit's education, skills, projects, or professional experience."
        })
      };
    }

    const route = routeQuery(message);
    const prompt = buildSystemPrompt(route, message);

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
          messages: [{ role: "system", content: prompt }],
          temperature: 0.3,
          max_tokens: 500
        })
      }
    );

    const data = await response.json();
    const reply =
      data?.choices?.[0]?.message?.content ||
      "That detail isn’t part of Kanan Pandit’s public portfolio.";

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
        reply: "Something went wrong. Please try again."
      })
    };
  } finally {
    await langfuse.flush();
  }
}
