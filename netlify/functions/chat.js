export async function handler(event){
  try{
    const {message}=JSON.parse(event.body);

    const prompt=`
You are an AI assistant for Kanan Pandit.
Answer ONLY about him.

Profile:
- AI/ML Engineer
- MSc Big Data Analytics
- ML, DL, CV, NLP, Distributed Systems
- Projects: Graph RAG, ICU Monitoring, Distributed ML
- Tools: PyTorch, Spark, H2O, HuggingFace

Question:
${message}
`;

    const r=await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key="+process.env.GEMINI_API_KEY,
      {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          contents:[{parts:[{text:prompt}]}]
        })
      }
    );

    const d=await r.json();

    return{
      statusCode:200,
      body:JSON.stringify({
        reply:d.candidates?.[0]?.content?.parts?.[0]?.text || "No answer available."
      })
    };
  }catch{
    return{
      statusCode:500,
      body:JSON.stringify({reply:"Server error."})
    };
  }
}
