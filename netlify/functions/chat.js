export async function handler(event) {
  try {
    const body = JSON.parse(event.body || "{}");
    const message = body.message || "";

    const apiKey = process.env.GEMINI_API_KEY;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: "You are an AI assistant that answers questions ONLY about Kanan Pandit. Be clear, professional, and concise."
              }
            ]
          },
          contents: [
            {
              parts: [
                {
                  text: `
Kanan Pandit Profile:
- AI/ML Engineer
- MSc Big Data Analytics
- Expertise: Machine Learning, Deep Learning, Computer Vision, NLP, Distributed Systems
- Tools: PyTorch, Spark, H2O, HuggingFace, OpenCV
- Projects: Graph RAG, ICU Monitoring, Distributed ML, Adversarial NLP
- Focus: Production AI and Medical AI

User Question:
${message}
                  `
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 512
          }
        })
      }
    );

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          reply:
            "⚠️ Gemini responded but produced no text. API is active — format issue resolved, retry."
        })
      };
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
