import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: NextRequest) {
  try {
    const { message, context, chatHistory } = await request.json()

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Build conversation history for context
    const conversationHistory = chatHistory
      .map((msg: any) => `${msg.sender === "user" ? "User" : "Assistant"}: ${msg.text}`)
      .join("\n")

    // Create a comprehensive prompt with user context
    const prompt = `
Kamu adalah AI Learning Assistant untuk platform LearnMate yang sangat membantu dan knowledgeable. Kamu didukung oleh Gemini AI dan memiliki expertise dalam berbagai bidang teknologi dan programming.

KONTEKS PENGGUNA:
- Minat Teknologi: ${context.selectedTech}
- Analisis AI Sebelumnya: ${context.aiAnalysis}
- Hasil Kuis: ${JSON.stringify(context.quizAnswers)}

RIWAYAT PERCAKAPAN:
${conversationHistory}

PESAN TERBARU DARI USER:
${message}

INSTRUKSI:
1. Jawab dalam bahasa Indonesia yang natural dan friendly
2. Berikan jawaban yang spesifik dan actionable
3. Gunakan konteks pengguna untuk memberikan advice yang personal
4. Jika pertanyaan tentang programming, berikan contoh code jika relevan
5. Selalu motivational dan supportive
6. Jika tidak tahu jawaban pasti, akui dan berikan guidance umum
7. Maksimal 200 kata per response
8. Gunakan formatting yang baik (line breaks untuk readability)

FOKUS AREA BERDASARKAN MINAT:
- Front End: HTML, CSS, JavaScript, React, Vue, Angular
- Back End: Node.js, Python, Java, PHP, Database, API
- UI/UX: Design principles, Figma, User research, Prototyping
- Machine Learning: Python, TensorFlow, PyTorch, Data Science
- Data Science: Python, R, Statistics, Visualization
- Cyber Security: Network security, Ethical hacking, Compliance

Berikan response yang helpful dan engaging!
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const aiResponse = response.text()

    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error("Error generating AI response:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
