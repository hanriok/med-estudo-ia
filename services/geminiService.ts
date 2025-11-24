
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { LearningStyle, Question, Flashcard, ChatMessage, Language, StudyMaterial } from '../types';

export const isApiKeySet = (): boolean => {
  return !!process.env.API_KEY;
};

let ai: GoogleGenAI | null = null;
const getAi = (): GoogleGenAI => {
    if (!isApiKeySet()) {
        throw new Error("API_KEY environment variable is not set. Cannot initialize GoogleGenAI.");
    }
    if (!ai) {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    }
    return ai;
};


const getLearningStylePrompt = (style: LearningStyle, language: Language): string => {
  const prompts = {
    en: {
      visual: "Provide a detailed explanation that refers to a helpful diagram, chart, or visual metaphor.",
      auditory: "Provide a detailed explanation as if you were speaking in a lecture. Use clear, spoken-language analogies.",
      practical: "Provide a detailed explanation that includes a real-world clinical case example.",
    },
    pt: {
      visual: "Forneça uma explicação detalhada que se refira a um diagrama, gráfico ou metáfora visual útil.",
      auditory: "Forneça uma explicação detalhada como se estivesse falando em uma palestra. Use analogias claras e em linguagem falada.",
      practical: "Forneça uma explicação detalhada que inclua um exemplo de caso clínico do mundo real.",
    }
  };
  return prompts[language][style] || (language === 'pt' ? "Forneça uma explicação detalhada." : "Provide a detailed explanation.");
};

export const generateQuestion = async (topic: string, style: LearningStyle, period: string, language: Language, materials?: StudyMaterial[]): Promise<Question> => {
  const aiInstance = getAi();
  const learningStyleInstruction = getLearningStylePrompt(style, language);
  
  let promptText = "";
  if (materials && materials.length > 0) {
      promptText = language === 'pt'
        ? `Com base nos materiais fornecidos (imagens/documentos), gere uma questão de múltipla escolha desafiadora e clinicamente relevante para um estudante de medicina no ${period}. Forneça uma resposta correta clara e três distratores plausíveis. A explicação deve ser completa e referenciar o material quando possível. ${learningStyleInstruction}`
        : `Based on the provided materials (images/documents), generate a challenging and clinically relevant multiple-choice question for a medical student in their ${period}. Provide one clear correct answer and three plausible distractors. The explanation should be thorough and reference the material where possible. ${learningStyleInstruction}`;
  } else {
      promptText = language === 'pt'
        ? `Gere uma questão de múltipla escolha estilo USMLE Step 1 sobre o tópico de ${topic}, apropriada para um estudante de medicina no ${period}. A questão deve ser desafiadora e clinicamente relevante. Forneça uma resposta correta clara e três distratores plausíveis. A explicação deve ser completa. ${learningStyleInstruction}`
        : `Generate a USMLE Step 1-style multiple-choice question on the topic of ${topic}, appropriate for a medical student in their ${period}. The question should be challenging and clinically relevant. Provide one clear correct answer and three plausible distractors. The explanation should be thorough. ${learningStyleInstruction}`;
  }

  const parts: any[] = [{ text: promptText }];
  
  if (materials) {
      materials.forEach(m => {
          parts.push({
              inlineData: {
                  mimeType: m.type,
                  data: m.data
              }
          });
      });
  }
  
  const response = await aiInstance.models.generateContent({
    model: "gemini-2.5-flash",
    contents: { parts },
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                question: { type: Type.STRING },
                options: {
                    type: Type.OBJECT,
                    properties: {
                        A: { type: Type.STRING },
                        B: { type: Type.STRING },
                        C: { type: Type.STRING },
                        D: { type: Type.STRING },
                    },
                    required: ["A", "B", "C", "D"],
                },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING },
            },
            required: ["question", "options", "correctAnswer", "explanation"],
        },
    },
  });

  try {
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (e) {
    console.error("Failed to parse JSON from Gemini:", response.text);
    throw new Error("Received malformed data from the AI.");
  }
};

export const generateFlashcards = async (
    inputText: string, 
    style: LearningStyle, 
    period: string, 
    language: Language,
    count: number = 5,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    materials?: StudyMaterial[]
): Promise<Flashcard[]> => {
    const aiInstance = getAi();
    const learningStyleInstruction = getLearningStylePrompt(style, language);
    const isLongText = inputText.length > 100;

    const diffDesc = {
        easy: language === 'pt' ? 'conceitos fundamentais e definições básicas' : 'fundamental concepts and basic definitions',
        medium: language === 'pt' ? 'correlações clínicas e fisiopatologia padrão' : 'clinical correlations and standard pathophysiology',
        hard: language === 'pt' ? 'detalhes complexos, exceções e mecanismos avançados' : 'complex details, exceptions, and advanced mechanisms'
    }[difficulty];

    const countPrompt = language === 'pt' 
        ? `Gere exatamente ${count} flashcards.` 
        : `Generate exactly ${count} flashcards.`;
    
    const diffPrompt = language === 'pt'
        ? `O nível de dificuldade deve ser ${difficulty} (${diffDesc}).`
        : `The difficulty level should be ${difficulty} (${diffDesc}).`;

    let prompt: string;
    
    if (materials && materials.length > 0) {
         prompt = language === 'pt'
            ? `Com base nos materiais fornecidos (imagens/documentos), gere um conjunto de flashcards de alto rendimento para um estudante de medicina no ${period}. ${countPrompt} ${diffPrompt} Cada flashcard deve ter uma pergunta clara e uma resposta concisa e precisa, extraindo as informações mais importantes do material visual ou textual. ${learningStyleInstruction}`
            : `Based on the provided materials (images/documents), generate a set of high-yield flashcards for a medical student in their ${period}. ${countPrompt} ${diffPrompt} Each flashcard should have a clear question and a concise, accurate answer, extracting the most important information from the visual or textual material. ${learningStyleInstruction}`;
    } else if (isLongText) {
        prompt = language === 'pt'
            ? `Com base no seguinte texto, gere um conjunto de flashcards de alto rendimento para um estudante de medicina no ${period}. ${countPrompt} ${diffPrompt} Cada flashcard deve ter uma pergunta clara e uma resposta concisa e precisa, extraindo as informações mais importantes do texto. Texto: "${inputText}". ${learningStyleInstruction}`
            : `Based on the following text, generate a set of high-yield flashcards for a medical student in their ${period}. ${countPrompt} ${diffPrompt} Each flashcard should have a clear question and a concise, accurate answer, extracting the most important information from the text. Text: "${inputText}". ${learningStyleInstruction}`;
    } else {
        prompt = language === 'pt'
            ? `Gere um conjunto de flashcards de alto rendimento para um estudante de medicina no ${period} sobre o tópico de "${inputText}". ${countPrompt} ${diffPrompt} Cada flashcard deve ter uma pergunta clara e uma resposta concisa e precisa. ${learningStyleInstruction}`
            : `Generate a set of high-yield flashcards for a medical student in their ${period} on the topic of "${inputText}". ${countPrompt} ${diffPrompt} Each flashcard should have a clear question and a concise, accurate answer. ${learningStyleInstruction}`;
    }

    const parts: any[] = [{ text: prompt }];
    if (materials) {
        materials.forEach(m => {
            parts.push({
                inlineData: {
                    mimeType: m.type,
                    data: m.data
                }
            });
        });
    }

    const response = await aiInstance.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING, description: 'The front of the flashcard.' },
                        answer: { type: Type.STRING, description: 'The back of the flashcard.' },
                    },
                    required: ["question", "answer"],
                },
            },
        },
    });
    
    try {
        const jsonText = response.text.trim();
        const parsedFlashcards: Omit<Flashcard, 'id'>[] = JSON.parse(jsonText);
        return parsedFlashcards.map((card, index) => ({ ...card, id: index }));
    } catch (e) {
        console.error("Failed to parse JSON from Gemini:", response.text);
        throw new Error("Received malformed data from the AI.");
    }
};

export const createTutorChat = (style: LearningStyle, period: string, language: Language, materials?: StudyMaterial[]): Chat => {
    const aiInstance = getAi();
    const learningStyleInstruction = getLearningStylePrompt(style, language);
    const systemInstruction = language === 'pt'
        ? `Você é um tutor clínico especialista para estudantes de medicina. Seu objetivo é explicar conceitos médicos complexos de forma clara e precisa. O estudante está no ${period}. Adapte a profundidade e complexidade de suas explicações para este nível. Suas respostas devem ser adaptadas para um aluno com perfil ${style}. ${learningStyleInstruction}`
        : `You are an expert clinical tutor for medical students. Your goal is to explain complex medical concepts clearly and accurately. The student is in their ${period}. Tailor the depth and complexity of your explanations for this level. Your responses should be tailored for a ${style} learner. ${learningStyleInstruction}`;

    const chatConfig: any = {
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
        },
    };

    // If materials are present, prime the chat with them in the history
    if (materials && materials.length > 0) {
        const contextMsg = language === 'pt' ? "Aqui estão alguns materiais de contexto (imagens/documentos) para nossa sessão." : "Here are some context materials (images/documents) for our session.";
        const parts: any[] = [{ text: contextMsg }];
        materials.forEach(m => {
            parts.push({
                inlineData: {
                    mimeType: m.type,
                    data: m.data
                }
            });
        });

        chatConfig.history = [
            {
                role: 'user',
                parts: parts
            },
            {
                role: 'model',
                parts: [{ text: language === 'pt' ? "Entendido. Usei esses materiais como contexto." : "Understood. I have reviewed the materials." }]
            }
        ];
    }

    return aiInstance.chats.create(chatConfig);
};

const patientScenarios = {
    en: [
        "You are a 58-year-old male with a history of hypertension and smoking, presenting with crushing substernal chest pain that started 1 hour ago.",
        "You are a 22-year-old female college student presenting with a severe headache, photophobia, and neck stiffness.",
        "You are a 65-year-old female with type 2 diabetes presenting with a painful, swollen, red right lower leg.",
        "You are a 45-year-old female presenting with right upper quadrant abdominal pain that worsens after eating fatty meals.",
        "You are a 30-year-old male presenting with a productive cough, fever, and shortness of breath for three days."
    ],
    pt: [
        "Você é um homem de 58 anos com histórico de hipertensão e tabagismo, apresentando dor torácica subesternal em aperto que começou há 1 hora.",
        "Você é uma estudante universitária de 22 anos apresentando dor de cabeça intensa, fotofobia e rigidez na nuca.",
        "Você é uma mulher de 65 anos com diabetes tipo 2 apresentando a perna direita dolorida, inchada e vermelha.",
        "Você é uma mulher de 45 anos apresentando dor abdominal no quadrante superior direito que piora após refeições gordurosas.",
        "Você é um homem de 30 anos apresentando tosse produtiva, febre e falta de ar há três dias."
    ]
};

export const createPatientChat = (period: string, language: Language, materials?: StudyMaterial[]): Chat => {
    const aiInstance = getAi();
    let scenarios = patientScenarios[language];
    let scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    
    // If materials are provided, we ask the AI to generate a patient case BASED on those materials
    if (materials && materials.length > 0) {
        scenario = language === 'pt'
            ? "O cenário clínico é baseado nos documentos médicos ou imagens fornecidos no início do chat. Aja como o paciente descrito ou implícito nesses materiais."
            : "The clinical scenario is based on the medical documents or images provided at the start of the chat. Act as the patient described or implied in those materials.";
    }
    
    const systemInstruction = language === 'pt'
      ? `Você está atuando como um paciente em uma simulação médica para um estudante no ${period}.
         Cenário Clínico: ${scenario}
         
         DIRETRIZES DE COMPORTAMENTO:
         1. Seja SIMPLES e DIRETO. Não faça discursos longos.
         2. Use linguagem coloquial (de leigo). Evite termos médicos técnicos a menos que um paciente comum saberia.
         3. Responda apenas o que for perguntado, de forma curta.
         4. Expresse emoções de forma realista (dor, preocupação) mas sem exagero dramático.
         5. Não revele seu diagnóstico final, apenas descreva os sintomas.`
      : `You are acting as a patient in a medical simulation for a student in their ${period}.
         Clinical Scenario: ${scenario}
         
         BEHAVIOR GUIDELINES:
         1. Be SIMPLE and DIRECT. Do not give long speeches.
         2. Use layperson language. Avoid technical medical terms unless a common patient would know them.
         3. Answer only what is asked, keeping it short.
         4. Express emotions realistically (pain, worry) but without over-dramatizing.
         5. Do not reveal your diagnosis, only describe symptoms.`;

    const chatConfig: any = {
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
        },
    };

    if (materials && materials.length > 0) {
        const contextMsg = language === 'pt' ? "Aqui estão os registros médicos/imagens do paciente." : "Here are the patient's medical records/images.";
        const parts: any[] = [{ text: contextMsg }];
        materials.forEach(m => {
            parts.push({
                inlineData: {
                    mimeType: m.type,
                    data: m.data
                }
            });
        });

        chatConfig.history = [
            {
                role: 'user',
                parts: parts
            },
            {
                role: 'model',
                parts: [{ text: language === 'pt' ? "Estou incorporando esses registros à minha persona." : "I am embodying the patient from these records." }]
            }
        ];
    }

    return aiInstance.chats.create(chatConfig);
};

export const evaluateDiagnosis = async (chatHistory: ChatMessage[], style: LearningStyle, period: string, language: Language): Promise<string> => {
    const aiInstance = getAi();
    const learningStyleInstruction = getLearningStylePrompt(style, language);
    const historyString = chatHistory.map(m => `${m.role}: ${m.content}`).join('\n');
    const prompt = language === 'pt'
        ? `Com base na seguinte interação com o paciente, avalie o diagnóstico final de um estudante de medicina do ${period}. Forneça feedback construtivo sobre suas perguntas, a precisão do diagnóstico e o que poderia ter sido feito de diferente, considerando o nível de conhecimento esperado para o ${period}. A interação é a seguinte:\n\n${historyString}\n\nSua avaliação deve ser útil e educacional. ${learningStyleInstruction}`
        : `Based on the following patient interaction, evaluate the final diagnosis of a medical student in their ${period}. Provide constructive feedback on their questioning, the accuracy of their diagnosis, and what they could have done differently, considering the expected knowledge level for a student in their ${period}. The interaction is as follows:\n\n${historyString}\n\nYour evaluation should be helpful and educational. ${learningStyleInstruction}`;
    
    const response = await aiInstance.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
    });

    const evaluationHeader = language === 'pt' ? 'AVALIAÇÃO DO DIAGNÓSTICO' : 'DIAGNOSIS EVALUATION';
    
    return `${evaluationHeader}\n\n${response.text}`;
};
