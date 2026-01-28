export async function handler(event) {
  try {
    const body = JSON.parse(event.body || "{}");
    const message = body.message;

    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ reply: "No message provided." })
      };
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://kananpanditportfolio.netlify.app",
          "X-Title": "Kanan Pandit Portfolio Chatbot"
        },
        body: JSON.stringify({
          model: "arcee-ai/trinity-large-preview:free",
          messages: [
            {
              role: "system",
              content: `
You are an AI assistant for Kanan Pandit.
Answer ONLY about Kanan Pandit.

Profile:
- AI/ML Engineer
- MSc Big Data Analytics
- Skills: ML, DL, CV, NLP, Distributed Systems
- Tools: PyTorch, Spark, H2O, HuggingFace, OpenCV
- Projects: Graph RAG, ICU Monitoring, Distributed ML
`
            },
            {
              role: "user",
              content: message
            }
          ],
          temperature: 0.4,
          max_tokens: 400
        })
      }
    );

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          reply: "⚠️ AI is busy. Please try again."
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
