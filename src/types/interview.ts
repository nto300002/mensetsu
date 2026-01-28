// 面接システムの型定義

export interface Question {
    id: number;
    category: string;
    question: string;
    intent: string;
    keywords: string[];
    expectedPoints: string[];
    terms?: Array<{
        term: string;
        reading: string;
    }>;
}

export interface Term {
    term: string;
    reading: string;
    shortDescription: string;
}

export interface TermExplanation {
    term: string;
    explanation: string;
    analogy?: string;
    whyImportant: string;
}

export interface Feedback {
    grade: 'A' | 'B' | 'C' | 'D';
    goodPoints: string[];
    improvements: string[];
    missingPoints: string[];
    summary: string;
}

export interface FollowupResponse {
    shouldFollowup: boolean;
    followupQuestion?: string;
    intent?: string;
    keywords?: string[];
}

export interface Answer {
    questionId: number;
    answerText: string;
    feedback?: Feedback;
    followupQuestions?: {
        question: string;
        answer?: string;
        feedback?: Feedback;
    }[];
}

export interface InterviewResult {
    questions: Question[];
    answers: Answer[];
    overallGrade: string;
    strengths: string[];
    areasToImprove: string[];
    advice: string;
    encouragement: string;
}

export interface InterviewState {
    questions: Question[];
    currentQuestionIndex: number;
    answers: Answer[];
    isLoading: boolean;
    error: string | null;
}
