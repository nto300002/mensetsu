'use client';

import { useState, useCallback } from 'react';
import { Question, Answer, Feedback, FollowupResponse } from '@/types/interview';

export function useInterview() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 質問を生成
    const generateQuestions = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/gemini/generate-questions', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to generate questions');
            }

            const data = await response.json();
            setQuestions(data.questions);
            setCurrentQuestionIndex(0);
            setAnswers([]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 回答を送信してフィードバックを取得
    const submitAnswer = useCallback(async (answerText: string): Promise<{ feedback: Feedback; followup: FollowupResponse | null }> => {
        setIsLoading(true);
        setError(null);

        try {
            const currentQuestion = questions[currentQuestionIndex];

            // フィードバックを取得
            const feedbackResponse = await fetch('/api/gemini/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: currentQuestion.question,
                    expectedPoints: currentQuestion.expectedPoints,
                    answer: answerText,
                }),
            });

            if (!feedbackResponse.ok) {
                throw new Error('Failed to get feedback');
            }

            const feedback: Feedback = await feedbackResponse.json();

            // 深掘り質問を取得
            const followupResponse = await fetch('/api/gemini/followup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    originalQuestion: currentQuestion.question,
                    answer: answerText,
                }),
            });

            let followup: FollowupResponse | null = null;
            if (followupResponse.ok) {
                followup = await followupResponse.json();
            }

            // 回答を保存
            const newAnswer: Answer = {
                questionId: currentQuestion.id,
                answerText,
                feedback,
                followupQuestions: [],
            };

            setAnswers(prev => [...prev, newAnswer]);

            return { feedback, followup };
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [questions, currentQuestionIndex]);

    // 深掘り質問への回答を送信
    const submitFollowupAnswer = useCallback(async (followupQuestion: string, answerText: string): Promise<Feedback> => {
        setIsLoading(true);
        setError(null);

        try {
            const currentQuestion = questions[currentQuestionIndex];

            // フィードバックを取得
            const feedbackResponse = await fetch('/api/gemini/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: followupQuestion,
                    expectedPoints: currentQuestion.expectedPoints,
                    answer: answerText,
                }),
            });

            if (!feedbackResponse.ok) {
                throw new Error('Failed to get feedback');
            }

            const feedback: Feedback = await feedbackResponse.json();

            // 深掘り質問と回答を保存
            setAnswers(prev => {
                const updated = [...prev];
                const lastAnswer = updated[updated.length - 1];
                if (lastAnswer) {
                    lastAnswer.followupQuestions = lastAnswer.followupQuestions || [];
                    lastAnswer.followupQuestions.push({
                        question: followupQuestion,
                        answer: answerText,
                        feedback,
                    });
                }
                return updated;
            });

            return feedback;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [questions, currentQuestionIndex]);

    // 次の質問に進む
    const nextQuestion = useCallback(() => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    }, [currentQuestionIndex, questions.length]);

    // 面接が完了したかどうか
    const isInterviewComplete = currentQuestionIndex >= questions.length - 1 && answers.length === questions.length;

    // 現在の質問
    const currentQuestion = questions[currentQuestionIndex] || null;

    return {
        questions,
        currentQuestion,
        currentQuestionIndex,
        answers,
        isLoading,
        error,
        isInterviewComplete,
        generateQuestions,
        submitAnswer,
        submitFollowupAnswer,
        nextQuestion,
    };
}
