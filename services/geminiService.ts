
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { LearningStyle, Question, Flashcard, ChatMessage, Language, StudyMaterial } from '../types';

export const isApiKeySet = (): boolean => {
  return !!process.env.API_KEY;
};

let ai: GoogleGenAI | null = null;
const getAi = (): GoogleGenAI => {
    if (!isApiKeySet()) {
        throw new Error("API_KEY environment variable is not set.");
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

// --- MOCK DATA GENERATORS FOR DEMO MODE ---
const getMockQuestion = (topic: string, language: Language): Question => {
    if (language === 'pt') {
        return {
            question: `[Simulação] Qual é a principal função das mitocôndrias em uma célula? (Tópico: ${topic})`,
            options: {
                A: "Síntese de proteínas",
                B: "Produção de ATP (Energia)",
                C: "Divisão celular",
                D: "Armazenamento de DNA"
            },
            correctAnswer: "B",
            explanation: "As mitocôndrias são conhecidas como a 'casa de força' da célula porque geram a maior parte do suprimento de adenosina trifosfato (ATP) da célula, usado como fonte de energia química. (Esta é uma resposta gerada localmente para fins de demonstração)."
        };
    }
    return {
        question: `[Simulation] What is the primary function of mitochondria in a cell? (Topic: ${topic})`,
        options: {
            A: "Protein Synthesis",
            B: "ATP Production (Energy)",
            C: "Cell Division",
            D: "DNA Storage"
        },
        correctAnswer: "B",
        explanation: "Mitochondria are known as the powerhouse of the cell because they generate most of the cell's supply of adenosine triphosphate (ATP), used as a source of chemical energy. (This is a locally generated response for demo purposes)."
    };
};

const getMockFlashcards = (topic: string, count: number, language: Language): Flashcard[] => {
    const cards = [];
    for (let i = 0; i < count; i++) {
        cards.push({
            id: i,
            question: language === 'pt' 
                ? `[Flashcard ${i+1}] Conceito chave sobre ${topic}?` 
                : `[Flashcard ${i+1}] Key concept regarding ${topic}?`,
            answer: language === 'pt'
                ? "Explicação detalhada do conceito médico simulado. Em modo real, a IA geraria definições precisas baseadas no material."
                : "Detailed explanation of the simulated medical concept. In live mode, AI would generate accurate definitions based on the material."
        });
    }
    return cards;
};

const getMockDiagnosisEvaluation = (language: Language): string => {
    if (language === 'pt') {
        return "AVALIAÇÃO DE DIAGNÓSTICO [SIMULADA]\n\nCom base na sua interação, seu raciocínio clínico parece sólido. Você fez perguntas pertinentes sobre a duração dos sintomas e fatores agravantes.\n\nPontos Fortes:\n- Investigou o histórico familiar.\n- Considerou diagnósticos diferenciais.\n\nÁreas para Melhoria:\n- Poderia ter perguntado mais sobre alergias medicamentosas.\n\nDiagnóstico Correto Provável: Enxaqueca com Aura.\n\n(Nota: Esta é uma avaliação simulada para demonstração.)";
    }
    return "DIAGNOSIS EVALUATION [SIMULATED]\n\nBased on your interaction, your clinical reasoning appears sound. You asked pertinent questions regarding symptom duration and aggravating factors.\n\nStrengths:\n- Investigated family history.\n- Considered differential diagnoses.\n\nAreas for Improvement:\n- Could have asked more about drug allergies.\n\nLikely Correct Diagnosis: Migraine with Aura.\n\n(Note: This is a simulated evaluation for demonstration.)";
};

const getMockSummary = (language: Language): string => {
    if (language === 'pt') {
        return "**Resumo do Documento [Simulado]**\n\n*   **Tópico Principal:** Diretrizes Clínicas de Hipertensão\n*   **Ponto Chave 1:** O diagnóstico requer múltiplas medições em ocasiões diferentes.\n*   **Ponto Chave 2:** A mudança no estilo de vida é a primeira linha de tratamento para pré-hipertensão.\n*   **Conclusão:** O monitoramento regular é essencial para prevenir complicações cardiovasculares.\n\n(A IA real analisaria o conteúdo específico do seu arquivo PDF/Imagem).";
    }
    return "**Document Summary [Simulated]**\n\n*   **Main Topic:** Hypertension Clinical Guidelines\n*   **Key Point 1:** Diagnosis requires multiple measurements on separate occasions.\n*   **Key Point 2:** Lifestyle modification is the first line of treatment for pre-hypertension.\n*   **Conclusion:** Regular monitoring is essential to prevent cardiovascular complications.\n\n(The real AI would analyze the specific content of your PDF/Image file).";
}

// --- END MOCK DATA ---

export const generateQuestion = async (topic: string, style: LearningStyle, period: string, language: Language, materials?: StudyMaterial[]): Promise<Question> => {
  if (!isApiKeySet()) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return getMockQuestion(topic, language);
  }

  try {
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

      const jsonText = response.text.trim();
      return JSON.parse(jsonText);
  } catch (e) {
    console.error("Failed to generate/parse question, falling back to mock:", e);
    return getMockQuestion(topic, language);
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
    if (!isApiKeySet()) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return getMockFlashcards(inputText || "Demo Topic", count, language);
    }

    try {
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
        
        const jsonText = response.text.trim();
        const parsedFlashcards: Omit<Flashcard, 'id'>[] = JSON.parse(jsonText);
        return parsedFlashcards.map((card, index) => ({ ...card, id: index }));
    } catch (e) {
        console.error("Failed to generate flashcards, falling back to mock:", e);
        return getMockFlashcards(inputText || "Demo", count, language);
    }
};

// Mock Chat Object for Demo Mode with Simluated Responses
const createMockChat = (language: Language, type: 'tutor' | 'patient' = 'patient') => {
    return {
        sendMessage: async (msg: string | string[]) => {
            const userMsg = Array.isArray(msg) ? msg[0] : msg;
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate thinking delay
            
            const lowerMsg = userMsg.toLowerCase();
            let responseText = "";
            
            if (type === 'patient') {
                if (language === 'pt') {
                    if (lowerMsg.includes('olá') || lowerMsg.includes('oi') || lowerMsg.includes('bom dia')) {
                        responseText = "Oi. Doutor, não estou me sentindo bem.";
                    } else if (lowerMsg.includes('dor')) {
                        responseText = "Sim, dói muito. Principalmente quando me movo.";
                    } else if (lowerMsg.includes('onde')) {
                        responseText = "Aqui no meu peito, é um aperto.";
                    } else {
                        responseText = "Não sei explicar direito, só sei que incomoda bastante.";
                    }
                } else {
                    if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
                        responseText = "Hi. Doc, I don't feel good.";
                    } else if (lowerMsg.includes('pain')) {
                        responseText = "Yeah, it hurts a lot. Especially when I move.";
                    } else if (lowerMsg.includes('where')) {
                        responseText = "Right here in my chest, it's tight.";
                    } else {
                        responseText = "I don't know how to explain it, it just bothers me.";
                    }
                }
            } else {
                // Tutor Persona
                if (language === 'pt') {
                     responseText = `[Modo Simulado] Como Tutor IA, posso explicar que "${userMsg}" é um conceito importante. Em um cenário real com a API conectada, eu forneceria detalhes sobre fisiopatologia, tratamento e quadro clínico. \n\nCom base nisso, você pode me dizer quais seriam os principais diagnósticos diferenciais?`;
                } else {
                     responseText = `[Simulated Mode] As an AI Tutor, I can explain that "${userMsg}" is an important concept. In a live scenario with the API connected, I would provide details on pathophysiology, treatment, and clinical presentation. \n\nGiven that, can you tell me what the main differential diagnoses would be?`;
                }
            }

            return {
                text: responseText
            };
        }
    } as unknown as Chat;
};

export const createTutorChat = (style: LearningStyle, period: string, language: Language, materials?: StudyMaterial[]): Chat => {
    // 1. Prepare Mock fallback
    const mockChat = createMockChat(language, 'tutor');

    // 2. Check Key existence
    if (!isApiKeySet()) {
        return mockChat;
    }

    try {
        const aiInstance = getAi();
        const learningStyleInstruction = getLearningStylePrompt(style, language);
        
        const systemInstruction = language === 'pt'
            ? `Você é um tutor clínico especialista para estudantes de medicina. Seu objetivo é explicar conceitos médicos complexos de forma clara e precisa. O estudante está no ${period}. Adapte a profundidade e complexidade de suas explicações para este nível. Suas respostas devem ser adaptadas para um aluno com perfil ${style}. ${learningStyleInstruction} 
            IMPORTANTE: Adote uma abordagem socrática. Após explicar o conceito solicitado, SEMPRE termine sua resposta fazendo uma pergunta de acompanhamento relevante (follow-up) para verificar a compreensão do aluno ou desafiá-lo a aplicar o conhecimento.`
            : `You are an expert clinical tutor for medical students. Your goal is to explain complex medical concepts clearly and accurately. The student is in their ${period}. Tailor the depth and complexity of your explanations for this level. Your responses should be tailored for a ${style} learner. ${learningStyleInstruction}
            IMPORTANT: Adopt a Socratic approach. After explaining the requested concept, ALWAYS end your response by asking a relevant follow-up question to check the student's understanding or challenge them to apply the knowledge.`;

        const chatConfig: any = {
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: systemInstruction,
            },
        };

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

        const realChat = aiInstance.chats.create(chatConfig);

        // 3. Return a Wrapper that catches API errors and falls back to mock
        return {
            sendMessage: async (msg: string | string[]) => {
                try {
                    return await realChat.sendMessage(msg);
                } catch (e) {
                    console.error("Gemini API Error in Tutor (falling back to mock):", e);
                    return await mockChat.sendMessage(Array.isArray(msg) ? msg[0] : msg);
                }
            }
        } as unknown as Chat;

    } catch (e) {
        console.error("Failed to initialize Gemini instance:", e);
        return mockChat;
    }
};

const patientScenarios = {
    en: [
        "You are a 58-year-old male with a history of hypertension and smoking, presenting with crushing substernal chest pain that started 1 hour ago. Diagnosis: Myocardial Infarction.",
        "You are a 22-year-old female college student presenting with a severe headache, photophobia, and neck stiffness. Diagnosis: Bacterial Meningitis.",
        "You are a 65-year-old female with type 2 diabetes presenting with a painful, swollen, red right lower leg. Diagnosis: Cellulitis.",
        "You are a 45-year-old female presenting with right upper quadrant abdominal pain that worsens after eating fatty meals. Diagnosis: Cholecystitis.",
        "You are a 30-year-old male presenting with a productive cough, fever, and shortness of breath for three days. Diagnosis: Community Acquired Pneumonia."
    ],
    pt: [
        "Você é um homem de 58 anos com histórico de hipertensão e tabagismo, apresentando dor torácica subesternal em aperto que começou há 1 hora. Diagnóstico: Infarto do Miocárdio.",
        "Você é uma estudante universitária de 22 anos apresentando dor de cabeça intensa, fotofobia e rigidez na nuca. Diagnóstico: Meningite Bacteriana.",
        "Você é uma mulher de 65 anos com diabetes tipo 2 apresentando a perna direita dolorida, inchada e vermelha. Diagnóstico: Celulite Infecciosa.",
        "Você é uma mulher de 45 anos apresentando dor abdominal no quadrante superior direito que piora após refeições gordurosas. Diagnóstico: Colecistite.",
        "Você é um homem de 30 anos apresentando tosse produtiva, febre e falta de ar há três dias. Diagnóstico: Pneumonia Comunitária."
    ]
};

export const createPatientChat = (period: string, language: Language, materials?: StudyMaterial[]): Chat => {
    const mockChat = createMockChat(language, 'patient');

    if (!isApiKeySet()) {
        return mockChat;
    }

    try {
        const aiInstance = getAi();
        let scenarios = patientScenarios[language];
        let fullScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        
        if (materials && materials.length > 0) {
            fullScenario = language === 'pt'
                ? "O cenário clínico é baseado nos documentos médicos ou imagens fornecidos no início do chat. Aja como o paciente descrito ou implícito nesses materiais."
                : "The clinical scenario is based on the medical documents or images provided at the start of the chat. Act as the patient described or implied in those materials.";
        }
        
        const systemInstruction = language === 'pt'
        ? `Você está atuando como um paciente em uma simulação médica para um estudante no ${period}.
            Cenário Secreto (NÃO REVELE): ${fullScenario}
            
            DIRETRIZES ESTRITAS DE COMPORTAMENTO:
            1. Você é LEIGO. NÃO use terminologia médica. Fale como uma pessoa comum.
            2. Seja BREVE e DIRETO. Responda com frases curtas. Não dê palestras.
            3. NÃO revele informações voluntariamente. O aluno deve PERGUNTAR para descobrir.
            4. Se o aluno perguntar "O que você tem?", diga apenas os sintomas físicos ("Dói aqui", "Estou enjoado"), não o diagnóstico.
            5. Expresse desconforto de forma realista, mas sem exageros teatrais.
            6. FORCE o aluno a pensar na próxima pergunta.`
        : `You are acting as a patient in a medical simulation for a student in their ${period}.
            Secret Scenario (DO NOT REVEAL): ${fullScenario}
            
            STRICT BEHAVIOR GUIDELINES:
            1. You are a LAYPERSON. DO NOT use medical terminology. Speak like a regular person.
            2. Be BRIEF and DIRECT. Answer in short sentences. Do not lecture.
            3. DO NOT volunteer information. The student must ASK to find out.
            4. If the student asks "What do you have?", only describe physical symptoms ("It hurts here", "I feel sick"), not the diagnosis.
            5. Express discomfort realistically, but without theatrical exaggeration.
            6. FORCE the student to think of the next question.`;

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
                    parts: [{ text: language === 'pt' ? "Certo. (Assumindo personagem baseado nos exames)." : "Okay. (Adopting persona based on records)." }]
                }
            ];
        }

        const realChat = aiInstance.chats.create(chatConfig);
        
        // Return wrapper
        return {
            sendMessage: async (msg: string | string[]) => {
                try {
                    return await realChat.sendMessage(msg);
                } catch (e) {
                    console.error("Gemini API Error in Patient Sim (falling back to mock):", e);
                    return await mockChat.sendMessage(Array.isArray(msg) ? msg[0] : msg);
                }
            }
        } as unknown as Chat;

    } catch (e) {
        console.error("Failed to initialize Gemini instance:", e);
        return mockChat;
    }
};

export const evaluateDiagnosis = async (chatHistory: ChatMessage[], style: LearningStyle, period: string, language: Language): Promise<string> => {
   return "Use new evaluateTreatment function";
};

export const evaluateTreatment = async (
    chatHistory: ChatMessage[], 
    treatmentPlan: string,
    language: Language
): Promise<{ correct: boolean; title: string; feedback: string }> => {
    if (!isApiKeySet()) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return {
            correct: true,
            title: language === 'pt' ? "Conduta Correta (Simulado)" : "Correct Management (Simulated)",
            feedback: language === 'pt' 
                ? "Esta é uma resposta simulada. No modo real, a IA analisaria seu diagnóstico e prescrição com base no cenário oculto."
                : "This is a simulated response. In live mode, AI would analyze your diagnosis and prescription based on the hidden scenario."
        };
    }

    try {
        const aiInstance = getAi();
        const historyText = chatHistory.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
        
        const prompt = language === 'pt'
            ? `Aja como um professor supervisor médico sênior.
            
            Histórico da Conversa:
            ${historyText}
            
            Plano de Tratamento/Diagnóstico do Aluno: "${treatmentPlan}"
            
            Avalie se o aluno identificou corretamente a condição implícita na conversa e se o tratamento proposto é adequado e curativo.
            
            Retorne APENAS um JSON no seguinte formato:
            {
                "correct": boolean, (true se o diagnóstico e tratamento principal estiverem corretos)
                "title": string, (ex: "Diagnóstico Correto" ou "Conduta Inadequada")
                "feedback": string (Explicação concisa de 2-3 frases sobre o porquê está correto ou errado, e qual seria o padrão ouro).
            }`
            : `Act as a senior medical supervisor.
            
            Conversation History:
            ${historyText}
            
            Student's Treatment/Diagnosis Plan: "${treatmentPlan}"
            
            Evaluate if the student correctly identified the condition implied in the conversation and if the proposed treatment is adequate and curative.
            
            Return ONLY JSON in the following format:
            {
                "correct": boolean, (true if diagnosis and main treatment are correct)
                "title": string, (e.g., "Correct Diagnosis" or "Inadequate Management")
                "feedback": string (Concise 2-3 sentence explanation of why it is correct or wrong, and what the gold standard would be).
            }`;

        const response = await aiInstance.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        return JSON.parse(response.text);
    } catch (e) {
        console.error("Error parsing evaluation, falling back to mock:", e);
        return {
            correct: false,
            title: "Connection Error",
            feedback: "Could not connect to AI service. Please check your network or API Key."
        };
    }
};

export const generateSummary = async (material: StudyMaterial, language: Language): Promise<string> => {
    if (!isApiKeySet()) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return getMockSummary(language);
    }

    try {
        const aiInstance = getAi();
        const prompt = language === 'pt'
            ? "Por favor, forneça um resumo abrangente e conciso do documento ou imagem fornecida. Destaque os principais conceitos médicos, definições importantes e relevância clínica. Organize a saída em tópicos (bullet points) claros para fácil leitura."
            : "Please provide a comprehensive yet concise summary of the provided document or image. Highlight key medical concepts, important definitions, and clinical relevance. Organize the output into clear bullet points for easy reading.";

        const parts = [
            { text: prompt },
            {
                inlineData: {
                    mimeType: material.type,
                    data: material.data
                }
            }
        ];

        const response = await aiInstance.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts }
        });
        return response.text;
    } catch (e) {
        console.error("Summary generation failed, falling back to mock:", e);
        return getMockSummary(language);
    }
};
