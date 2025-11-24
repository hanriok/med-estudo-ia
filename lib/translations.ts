
import { Language } from '../types';

type Translations = {
  [key in Language]: {
    common: {
        backButton: string;
        listening: string;
    },
    apiKeyMissing: {
        title: string;
        message: string;
        variableName: string;
        variableInstructions: string;
        footer: string;
    },
    auth: {
      title: string;
      createAccountTitle: string;
      loginTitle: string;
      form: {
        name: string;
        phone: string;
        email: string;
        password: string;
        passwordConfirm: string;
        university: string;
        period: string;
        namePlaceholder: string;
        phonePlaceholder: string;
        emailPlaceholder: string;
        passwordPlaceholder: string;
        passwordConfirmPlaceholder: string;
        universityPlaceholder: string;
        selectPeriod: string;
      };
      errors: {
        passwordsDoNotMatch: string;
      };
      periods: string[];
      loginButton: string;
      googleLoginButton: string;
      guestLoginButton: string;
      createAccountButton: string;
      toggleToLogin: string;
      toggleToRegister: string;
      learningStyleTitle: string;
      learningStyleSubtitle: string;
      visual: { title: string; description: string };
      auditory: { title: string; description: string };
      practical: { title: string; description: string };
      finishButton: string;
    };
    sidebar: {
      dashboard: string;
      questionBank: string;
      flashcards: string;
      aiTutor: string;
      patientSimulator: string;
      progress: string;
      materials: string;
      logout: string;
      voiceOutput: string;
      settings: string;
    };
    dashboard: {
      title: string;
      subtitle: string;
      cta: string;
      questionBank: { title: string; description: string };
      flashcards: { title: string; description: string };
      aiTutor: { title: string; description: string };
      patientSimulator: { title: string; description: string };
      progress: { title: string; description: string };
    };
    questionBank: {
        title: string;
        subtitle: string;
        generateButton: string;
        generatingButton: string;
        error: string;
        loadingMessage: string;
        explanation: string;
        reviewMode: string;
        timedMode: string;
        timesUp: string;
        keyboardShortcutHint: string;
        sourceContext: string;
        sourceGeneral: string;
    };
    flashcardGenerator: {
        title: string;
        subtitle: string;
        placeholder: string;
        generateButton: string;
        generatingButton: string;
        errorTopic: string;
        errorGenerate: string;
        placeholderCard: string;
        flashcardCount: string;
        difficultyLevel: string;
        difficultyEasy: string;
        difficultyMedium: string;
        difficultyHard: string;
        useMaterials: string;
        useText: string;
    };
    clinicalTutor: {
        title: string;
        subtitle: string;
        initialMessage: string;
        placeholder: string;
        error: string;
        usingContext: string;
    };
    patientSimulator: {
        title: string;
        subtitle: string;
        newCaseButton: string;
        initialMessage: string;
        diagnosisPrefix: string;
        diagnosisPrompt: string;
        placeholderQuestion: string;
        placeholderDiagnosis: string;
        error: string;
        usingContext: string;
    };
    progressTracker: {
        title: string;
        subtitle: string;
        noData: string;
        chartKey: string;
        totalQuestions: string;
        averageAccuracy: string;
        totalTime: string;
        weakAreas: string;
        noWeakAreas: string;
        strongPerformance: string;
        timeSpent: string;
        moduleTime: string;
        topicPerformance: string;
        analytics: string;
        focusAreas: string;
        needsReview: string;
    };
    materials: {
        title: string;
        subtitle: string;
        uploadArea: string;
        uploadSubtext: string;
        uploadedFiles: string;
        noFiles: string;
    };
    settings: {
        title: string;
        subtitle: string;
        profile: string;
        appSettings: string;
        language: string;
        period: string;
        learningStyle: string;
        updateSuccess: string;
    };
    medicalTopics: string[];
  };
};

export const translations: Translations = {
  en: {
    common: {
        backButton: "Back to Dashboard",
        listening: "Listening..."
    },
    apiKeyMissing: {
        title: "Configuration Required",
        message: "The application cannot connect to the AI service because the Gemini API Key is missing.",
        variableName: "API_KEY",
        variableInstructions: "The administrator of this site must set this environment variable in the hosting platform's settings.",
        footer: "This is a required step for the application to function."
    },
    auth: {
        title: "Welcome to MED Estudo IA",
        createAccountTitle: "Create Your Account",
        loginTitle: "Login to Your Account",
        form: {
            name: "Full Name",
            phone: "Phone (Optional)",
            email: "Email",
            password: "Password",
            passwordConfirm: "Confirm Password",
            university: "University",
            period: "Course Period",
            namePlaceholder: "e.g., John Doe",
            phonePlaceholder: "e.g., +1 555-123-4567",
            emailPlaceholder: "e.g., john.doe@email.com",
            passwordPlaceholder: "Enter your password",
            passwordConfirmPlaceholder: "Confirm your password",
            universityPlaceholder: "e.g., Stanford University",
            selectPeriod: "Select your period...",
        },
        errors: {
            passwordsDoNotMatch: "Passwords do not match."
        },
        periods: ["1st Period", "2nd Period", "3rd Period", "4th Period", "5th Period", "6th Period", "7th Period", "8th Period", "9th Period", "10th Period", "11th Period", "12th Period"],
        loginButton: "Login",
        googleLoginButton: "Login with Google",
        guestLoginButton: "Enter without logging in",
        createAccountButton: "Create Account",
        toggleToLogin: "Already have an account? Login",
        toggleToRegister: "Don't have an account? Create one",
        learningStyleTitle: "One Last Step!",
        learningStyleSubtitle: "To personalize your learning experience, please select the style that best describes how you learn.",
        visual: { title: "Visual", description: "I learn best by seeing diagrams, charts, and visual aids." },
        auditory: { title: "Auditory", description: "I learn best by listening to explanations and spoken analogies." },
        practical: { title: "Practical", description: "I learn best through case studies and real-world examples." },
        finishButton: "Finish & Start Learning",
    },
    sidebar: {
      dashboard: "Dashboard",
      questionBank: "Question Bank",
      flashcards: "Flashcards",
      aiTutor: "AI Tutor",
      patientSimulator: "Patient Simulator",
      progress: "Progress",
      materials: "Study Materials",
      logout: "Logout",
      voiceOutput: "Voice Output",
      settings: "Settings"
    },
    dashboard: {
        title: "Dashboard",
        subtitle: "Welcome to your AI-powered medical study co-pilot. Select a module to begin.",
        cta: "Start Module",
        questionBank: { title: "Question Bank", description: "Test your knowledge with an endless supply of AI-generated questions." },
        flashcards: { title: "Flashcard Generator", description: "Instantly create flashcards from any medical topic or your own notes." },
        aiTutor: { title: "AI Clinical Tutor", description: "Ask complex clinical questions and get detailed explanations from your AI tutor." },
        patientSimulator: { title: "Patient Simulator", description: "Hone your diagnostic skills by interacting with realistic AI patients." },
        progress: { title: "Progress Tracker", description: "Visualize your performance and identify areas for improvement." },
    },
    questionBank: {
        title: "Intelligent Question Bank",
        subtitle: "Select a topic to generate an AI-powered multiple-choice question.",
        generateButton: "Generate New Question",
        generatingButton: "Generating...",
        error: "Failed to generate question. Please try again.",
        loadingMessage: "Generating your question...",
        explanation: "Explanation",
        reviewMode: "Review Mode",
        timedMode: "Timed Mode",
        timesUp: "Time's up!",
        keyboardShortcutHint: "Pro Tip: Use A, B, C, D to answer and N for the next question.",
        sourceContext: "From Uploaded Materials",
        sourceGeneral: "General Knowledge"
    },
    flashcardGenerator: {
        title: "Flashcard Generator",
        subtitle: "Enter a topic or paste text, and our AI will create a set of flashcards for you.",
        placeholder: "Enter a topic (e.g., 'The Kreb's Cycle') or paste your notes here...",
        generateButton: "Generate Flashcards",
        generatingButton: "Generating...",
        errorTopic: "Please enter a topic or text.",
        errorGenerate: "Failed to generate flashcards. Please try again.",
        placeholderCard: "Your generated flashcards will appear here.",
        flashcardCount: "Number of Cards",
        difficultyLevel: "Difficulty",
        difficultyEasy: "Easy",
        difficultyMedium: "Medium",
        difficultyHard: "Hard",
        useMaterials: "Use Uploaded Materials",
        useText: "Use Topic / Text"
    },
    clinicalTutor: {
        title: "AI Clinical Tutor",
        subtitle: "Ask any clinical question, from simple definitions to complex patient cases.",
        initialMessage: "Hello! I am your AI Clinical Tutor. How can I help you understand a medical topic today?",
        placeholder: "Ask about a disease, treatment, or mechanism...",
        error: "Sorry, I encountered an error. Please try again.",
        usingContext: "Using Context from Uploaded Materials"
    },
    patientSimulator: {
        title: "Realistic Patient Simulator",
        subtitle: "Practice your clinical reasoning by interviewing an AI patient.",
        newCaseButton: "New Case",
        initialMessage: "New case started. I am your patient. Please begin by asking me some questions about why I'm here today.",
        diagnosisPrefix: "My diagnosis is",
        diagnosisPrompt: "Ready to make a diagnosis? Toggle the switch and submit your conclusion.",
        placeholderQuestion: "Ask your patient a question...",
        placeholderDiagnosis: "Enter your diagnosis here...",
        error: "Sorry, I encountered an error. Please try again.",
        usingContext: "Simulating Case from Uploaded Materials"
    },
    progressTracker: {
        title: "Analytics Dashboard",
        subtitle: "Review your comprehensive study performance, track time, and identify weak spots.",
        noData: "Your progress and analytics will appear here once you start studying.",
        chartKey: "Correct %",
        totalQuestions: "Questions Answered",
        averageAccuracy: "Average Accuracy",
        totalTime: "Total Study Time",
        weakAreas: "Weak Areas Detected",
        noWeakAreas: "No Weak Areas Detected",
        strongPerformance: "You are performing well across all attempted topics.",
        timeSpent: "Time Distribution",
        moduleTime: "Time by Module",
        topicPerformance: "Performance by Topic",
        analytics: "Detailed Analytics",
        focusAreas: "Focus Areas",
        needsReview: "Needs Review",
    },
    materials: {
        title: "Study Materials",
        subtitle: "Upload PDFs or images to use as context for questions, flashcards, and simulations.",
        uploadArea: "Drag & drop files here, or click to select",
        uploadSubtext: "Supports PDF, PNG, JPG (Max 5MB)",
        uploadedFiles: "Uploaded Files",
        noFiles: "No materials uploaded yet."
    },
    settings: {
        title: "Settings",
        subtitle: "Manage your profile and preferences.",
        profile: "Profile",
        appSettings: "App Settings",
        language: "Language",
        period: "Course Period",
        learningStyle: "Learning Style",
        updateSuccess: "Settings updated successfully.",
    },
    medicalTopics: [
      "Anatomy",
      "Biochemistry",
      "Physiology",
      "Pathology",
      "Pharmacology",
      "Microbiology",
      "Immunology",
      "Cardiology",
      "Pulmonology",
      "Gastroenterology",
      "Nephrology",
      "Endocrinology",
      "Hematology & Oncology",
      "Neurology",
      "Psychiatry",
      "Dermatology",
      "Rheumatology",
      "Pediatrics",
      "Obstetrics & Gynecology",
      "General Surgery",
      "Orthopedics",
      "Ophthalmology",
      "ENT (Otolaryngology)",
      "Radiology",
      "Emergency Medicine",
      "Medical Ethics"
    ],
  },
  pt: {
    common: {
        backButton: "Voltar ao Painel",
        listening: "Ouvindo..."
    },
    apiKeyMissing: {
        title: "Configuração Necessária",
        message: "A aplicação não consegue se conectar ao serviço de IA porque a Chave da API Gemini está ausente.",
        variableName: "API_KEY",
        variableInstructions: "O administrador deste site deve definir esta variável de ambiente nas configurações da plataforma de hospedagem.",
        footer: "Este é um passo obrigatório para que a aplicação funcione."
    },
    auth: {
        title: "Bem-vindo ao MED Estudo IA",
        createAccountTitle: "Crie Sua Conta",
        loginTitle: "Acesse Sua Conta",
        form: {
            name: "Nome Completo",
            phone: "Telefone (Opcional)",
            email: "E-mail",
            password: "Senha",
            passwordConfirm: "Confirmar Senha",
            university: "Faculdade",
            period: "Período do Curso",
            namePlaceholder: "ex: João da Silva",
            phonePlaceholder: "ex: +55 11 98765-4321",
            emailPlaceholder: "ex: joao.silva@email.com",
            passwordPlaceholder: "Digite sua senha",
            passwordConfirmPlaceholder: "Confirme sua senha",
            universityPlaceholder: "ex: Universidade de São Paulo",
            selectPeriod: "Selecione seu período...",
        },
        errors: {
            passwordsDoNotMatch: "As senhas não coincidem."
        },
        periods: ["1º Período", "2º Período", "3º Período", "4º Período", "5º Período", "6º Período", "7º Período", "8º Período", "9º Período", "10º Período", "11º Período", "12º Período"],
        loginButton: "Entrar",
        googleLoginButton: "Entrar com Google",
        guestLoginButton: "Entrar sem logar",
        createAccountButton: "Criar Conta",
        toggleToLogin: "Já tem uma conta? Faça login",
        toggleToRegister: "Não tem uma conta? Crie uma",
        learningStyleTitle: "Um Último Passo!",
        learningStyleSubtitle: "Para personalizar sua experiência de aprendizado, selecione o estilo que melhor descreve como você aprende.",
        visual: { title: "Visual", description: "Aprendo melhor vendo diagramas, gráficos e auxílios visuais." },
        auditory: { title: "Auditivo", description: "Aprendo melhor ouvindo explicações e analogias faladas." },
        practical: { title: "Prático", description: "Aprendo melhor através de estudos de caso e exemplos do mundo real." },
        finishButton: "Finalizar e Começar a Aprender",
    },
    sidebar: {
      dashboard: "Painel",
      questionBank: "Banco de Questões",
      flashcards: "Flashcards",
      aiTutor: "Tutor IA",
      patientSimulator: "Simulador de Paciente",
      progress: "Progresso",
      materials: "Materiais de Estudo",
      logout: "Sair",
      voiceOutput: "Saída de Voz",
      settings: "Configurações"
    },
    dashboard: {
        title: "Painel",
        subtitle: "Bem-vindo ao seu co-piloto de estudos médicos com IA. Selecione um módulo para começar.",
        cta: "Iniciar Módulo",
        questionBank: { title: "Banco de Questões", description: "Teste seus conhecimentos com um suprimento infinito de questões geradas por IA." },
        flashcards: { title: "Gerador de Flashcards", description: "Crie flashcards instantaneamente a partir de qualquer tópico médico ou de suas próprias anotações." },
        aiTutor: { title: "Tutor Clínico IA", description: "Faça perguntas clínicas complexas e obtenha explicações detalhadas do seu tutor IA." },
        patientSimulator: { title: "Simulador de Paciente", description: "Aprimore suas habilidades de diagnóstico interagindo com pacientes de IA realistas." },
        progress: { title: "Acompanhamento de Progresso", description: "Visualize seu desempenho e identifique áreas para melhoria." },
    },
    questionBank: {
        title: "Banco de Questões Inteligente",
        subtitle: "Selecione um tópico para gerar uma questão de múltipla escolha com IA.",
        generateButton: "Gerar Nova Questão",
        generatingButton: "Gerando...",
        error: "Falha ao gerar a questão. Por favor, tente novamente.",
        loadingMessage: "Gerando sua questão...",
        explanation: "Explicação",
        reviewMode: "Modo Revisão",
        timedMode: "Modo Cronometrado",
        timesUp: "Tempo esgotado!",
        keyboardShortcutHint: "Dica: Use A, B, C, D para responder e N para a próxima questão.",
        sourceContext: "Usar Materiais Enviados",
        sourceGeneral: "Conhecimento Geral"
    },
    flashcardGenerator: {
        title: "Gerador de Flashcards",
        subtitle: "Digite um tópico ou cole um texto, e nossa IA criará um conjunto de flashcards para você.",
        placeholder: "Digite um tópico (ex: 'O Ciclo de Krebs') ou cole suas anotações aqui...",
        generateButton: "Gerar Flashcards",
        generatingButton: "Gerando...",
        errorTopic: "Por favor, insira um tópico ou texto.",
        errorGenerate: "Falha ao gerar os flashcards. Por favor, tente novamente.",
        placeholderCard: "Seus flashcards gerados aparecerão aqui.",
        flashcardCount: "Número de Cartas",
        difficultyLevel: "Dificuldade",
        difficultyEasy: "Fácil",
        difficultyMedium: "Médio",
        difficultyHard: "Difícil",
        useMaterials: "Usar Materiais Enviados",
        useText: "Usar Tópico / Texto"
    },
    clinicalTutor: {
        title: "Tutor Clínico IA",
        subtitle: "Faça qualquer pergunta clínica, de definições simples a casos de pacientes complexos.",
        initialMessage: "Olá! Eu sou seu Tutor Clínico de IA. Como posso ajudá-lo a entender um tópico médico hoje?",
        placeholder: "Pergunte sobre uma doença, tratamento ou mecanismo...",
        error: "Desculpe, encontrei um erro. Por favor, tente novamente.",
        usingContext: "Usando Contexto dos Materiais Enviados"
    },
    patientSimulator: {
        title: "Simulador de Paciente Realista",
        subtitle: "Pratique seu raciocínio clínico entrevistando um paciente de IA.",
        newCaseButton: "Novo Caso",
        initialMessage: "Novo caso iniciado. Eu sou seu paciente. Por favor, comece me fazendo algumas perguntas sobre o motivo da minha vinda hoje.",
        diagnosisPrefix: "Meu diagnóstico é",
        diagnosisPrompt: "Pronto para fazer um diagnóstico? Alterne o interruptor e envie sua conclusão.",
        placeholderQuestion: "Faça uma pergunta ao seu paciente...",
        placeholderDiagnosis: "Digite seu diagnóstico aqui...",
        error: "Desculpe, encontrei um erro. Por favor, tente novamente.",
        usingContext: "Simulando Caso com Materiais Enviados"
    },
    progressTracker: {
        title: "Painel de Análise",
        subtitle: "Analise seu desempenho completo, monitore o tempo e identifique pontos fracos.",
        noData: "Seu progresso e análises aparecerão aqui quando você começar a estudar.",
        chartKey: "% Corretas",
        totalQuestions: "Questões Respondidas",
        averageAccuracy: "Precisão Média",
        totalTime: "Tempo Total de Estudo",
        weakAreas: "Pontos Fracos Detectados",
        noWeakAreas: "Nenhum Ponto Fraco Detectado",
        strongPerformance: "Você está indo bem em todos os tópicos tentados.",
        timeSpent: "Distribuição de Tempo",
        moduleTime: "Tempo por Módulo",
        topicPerformance: "Desempenho por Tópico",
        analytics: "Análise Detalhada",
        focusAreas: "Áreas de Foco",
        needsReview: "Precisa de Revisão",
    },
    materials: {
        title: "Materiais de Estudo",
        subtitle: "Envie PDFs ou imagens para usar como contexto para questões, flashcards e simulações.",
        uploadArea: "Arraste e solte arquivos aqui, ou clique para selecionar",
        uploadSubtext: "Suporta PDF, PNG, JPG (Máx 5MB)",
        uploadedFiles: "Arquivos Enviados",
        noFiles: "Nenhum material enviado ainda."
    },
    settings: {
        title: "Configurações",
        subtitle: "Gerencie seu perfil e preferências.",
        profile: "Perfil",
        appSettings: "Configurações do App",
        language: "Idioma",
        period: "Período do Curso",
        learningStyle: "Estilo de Aprendizado",
        updateSuccess: "Configurações atualizadas com sucesso.",
    },
    medicalTopics: [
      "Anatomia",
      "Bioquímica",
      "Fisiologia",
      "Patologia",
      "Farmacologia",
      "Microbiologia",
      "Imunologia",
      "Cardiologia",
      "Pneumologia",
      "Gastroenterologia",
      "Nefrologia",
      "Endocrinologia",
      "Hematologia e Oncologia",
      "Neurologia",
      "Psiquiatria",
      "Dermatologia",
      "Reumatologia",
      "Pediatria",
      "Obstetrícia e Ginecologia",
      "Cirurgia Geral",
      "Ortopedia",
      "Oftalmologia",
      "Otorrinolaringologia",
      "Radiologia",
      "Medicina de Emergência",
      "Ética Médica"
    ],
  }
};
