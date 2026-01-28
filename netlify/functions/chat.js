export async function handler(event) {
  try {
    const { message } = JSON.parse(event.body || "{}");

    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
You are an AI assistant for Kanan Pandit.

Profile:
- AI/ML Engineer
- MSc Big Data Analytics
- Expertise: ML, DL, CV, NLP, Distributed Systems
- Projects: Graph RAG, ICU Monitoring, Distributed ML, Adversarial NLP

Answer clearly and professionally.

Question:
${message}
                  `
                }
              ]
            }
          ]
        })
      }
    );

    const data = await res.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      throw new Error("Gemini returned no text");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        reply: "Error: " + err.message
      })
    };
  }
}
