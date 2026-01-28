export async function handler(event) {
  try {
    const { message } = JSON.parse(event.body);

    const apiKey = process.env.GEMINI_API_KEY;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `
You are an AI assistant for Kanan Pandit.
Answer ONLY using the information below.

Profile:
- AI/ML Engineer
- MSc Big Data Analytics
- Strong in ML, DL, CV, NLP, Distributed Systems
- Projects: Graph RAG, ICU Monitoring, Distributed ML
- Tools: PyTorch, Spark, H2O, HuggingFace
- Focus: Production AI & Medical AI

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

    const data = await response.json();

    // 🔍 DEBUG SAFETY
    console.log("Gemini response:", JSON.stringify(data));

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          reply: "⚠️ Gemini returned no text. Check API & model access."
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
