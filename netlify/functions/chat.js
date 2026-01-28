export async function handler(event) {
  try {
    const { message } = JSON.parse(event.body);

    const apiKey = process.env.GEMINI_API_KEY;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
Answer ONLY about Kanan Pandit.

Profile:
- AI/ML Engineer
- MSc Big Data Analytics
- Strong in ML, DL, CV, NLP, Distributed Systems
- Projects: Graph RAG, ICU Monitoring, Distributed ML
- Tools: PyTorch, Spark, H2O, HuggingFace, OpenCV
- Focus: Production AI & Medical AI

Question:
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
          reply: "Gemini is active but returned empty output. Try again."
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
