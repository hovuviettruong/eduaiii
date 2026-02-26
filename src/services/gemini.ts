import { Subject, Difficulty, QuestionType, Question, Language } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateQuestionBatch(
  subject: Subject,
  topic: string,
  easyCount: number,
  mediumCount: number,
  hardCount: number,
  language: Language = 'vi'
): Promise<Question[]> {
  const langText = language === 'vi' ? 'Tiếng Việt' : 'English';
  const totalCount = easyCount + mediumCount + hardCount;
  const prompt = `
    Bạn là một giáo viên chuyên môn môn ${subject} cấp THPT.
    Hãy tạo một bộ gồm ${totalCount} câu hỏi trắc nghiệm thuộc "${topic}".
    TẤT CẢ CÂU HỎI VÀ GIẢI THÍCH PHẢI ĐƯỢC VIẾT BẰNG ${langText}.
    
    Yêu cầu về độ khó:
    - Tạo đúng ${easyCount} câu hỏi mức độ Dễ (Easy).
    - Tạo đúng ${mediumCount} câu hỏi mức độ Trung bình (Medium).
    - Tạo đúng ${hardCount} câu hỏi mức độ Khó (Hard).

    LƯU Ý QUAN TRỌNG VỀ TOÁN HỌC VÀ KÝ HIỆU: 
    - Bắt buộc sử dụng LaTeX chuẩn cho TẤT CẢ công thức toán học, vật lý, hóa học (ví dụ: vector, phân số, tích phân...).
    - Bọc công thức inline trong dấu $...$ (ví dụ: $\\vec{AC}$, $x^2 + y^2 = 1$).
    - Bọc công thức block trong dấu $$...$$.

    Trả về ĐÚNG định dạng JSON là một object có chứa 1 key "questions" là một mảng (array) chứa đúng ${totalCount} object câu hỏi. Mỗi object có các trường:
    - content: Nội dung câu hỏi
    - options: Mảng 4 lựa chọn (A, B, C, D)
    - correctAnswerIndex: Vị trí đáp án đúng (0-3)
    - explanation: Giải thích chi tiết tại sao đáp án đó đúng
    - difficulty: "Easy", "Medium", hoặc "Hard"
    - type: "Direct" hoặc "Applied"
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                content: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswerIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
                difficulty: { type: Type.STRING },
                type: { type: Type.STRING },
              },
              required: ["content", "options", "correctAnswerIndex", "explanation", "difficulty", "type"],
            }
          }
        },
        required: ["questions"]
      },
    },
  });

  const data = JSON.parse(response.text.trim());
  return mapData(data.questions, subject, topic);
}

function mapData(data: any[], subject: Subject, topic: string): Question[] {
  return data.map((q: any) => ({
    id: Math.random().toString(36).substring(7),
    subject,
    topic,
    difficulty: q.difficulty as Difficulty,
    type: q.type as QuestionType,
    content: q.content,
    options: q.options,
    correctAnswerIndex: q.correctAnswerIndex,
    explanation: q.explanation,
  }));
}
