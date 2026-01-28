import OpenAI from "openai";

export async function handler(event) {
  try {
    const { message } = JSON.parse(event.body || "{}");

    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ reply: "No message received." })
      };
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // fast + cheap + excellent
      messages: [
        {
          role: "system",
          content: `
You are an AI assistant for Kanan Pandit.

Answer ONLY about Kanan Pandit.
Be professional, concise, and accurate.

Profile:
- AI/ML Engineer
- MSc Big Data Analytics
- Strong in ML, DL, CV, NLP, Distributed Systems
- Tools: PyTorch, Spark, H2O, HuggingFace, OpenCV
- Projects: Graph RAG, ICU Monitoring, Distributed ML
`
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 400,
      temperature: 0.3
    });

    const reply = completion.choices[0].message.content;

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
