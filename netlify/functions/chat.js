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
You are a professional AI assistant for Kanan Pandit.

Answer ONLY about Kanan Pandit.
Be concise, factual, and professional.

Question:
${message}
                  `
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 512
          }
        })
      }
    );

    const data = await res.json();

    // 🔎 Robust text extraction
    let reply = null;

    if (data?.candidates?.length) {
      for (const part of data.candidates[0].content?.parts || []) {
        if (part.text) {
          reply = part.text;
          break;
        }
      }
    }

    // 🚨 Safety / quota / silent block
    if (!reply) {
      console.error("Gemini raw response:", JSON.stringify(data));
      return {
        statusCode: 200,
        body: JSON.stringify({
          reply:
            "⚠️ AI is temporarily unavailable. Please try again in a moment."
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
