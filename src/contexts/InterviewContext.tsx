'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Question, Answer } from '@/types/interview';

interface InterviewContextType {
    questions: Question[];
    answers: Answer[];
    setInterviewData: (questions: Question[], answers: Answer[]) => void;
    clearInterviewData: () => void;
}

const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

export function InterviewProvider({ children }: { children: ReactNode }) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Answer[]>([]);

    const setInterviewData = (newQuestions: Question[], newAnswers: Answer[]) => {
        setQuestions(newQuestions);
        setAnswers(newAnswers);

        // localStorageにも保存
        if (typeof window !== 'undefined') {
            localStorage.setItem('interview_questions', JSON.stringify(newQuestions));
            localStorage.setItem('interview_answers', JSON.stringify(newAnswers));
        }
    };

    const clearInterviewData = () => {
        setQuestions([]);
        setAnswers([]);

        if (typeof window !== 'undefined') {
            localStorage.removeItem('interview_questions');
            localStorage.removeItem('interview_answers');
        }
    };

    return (
        <InterviewContext.Provider value={{ questions, answers, setInterviewData, clearInterviewData }}>
            {children}
        </InterviewContext.Provider>
    );
}

export function useInterviewContext() {
    const context = useContext(InterviewContext);
    if (context === undefined) {
        throw new Error('useInterviewContext must be used within an InterviewProvider');
    }
    return context;
}
