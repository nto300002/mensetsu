'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInterview } from '@/hooks/useInterview';
import { useInterviewContext } from '@/contexts/InterviewContext';
import { QuestionCard } from '@/components/interview/QuestionCard';
import { AnswerForm } from '@/components/interview/AnswerForm';
import { FeedbackCard } from '@/components/interview/FeedbackCard';
import { FollowupQuestion } from '@/components/interview/FollowupQuestion';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { Feedback, FollowupResponse } from '@/types/interview';

export default function InterviewPage() {
    const router = useRouter();
    const {
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
    } = useInterview();

    const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null);
    const [currentFollowup, setCurrentFollowup] = useState<FollowupResponse | null>(null);
    const [followupFeedback, setFollowupFeedback] = useState<Feedback | null>(null);
    const [showNextButton, setShowNextButton] = useState(false);

    useEffect(() => {
        // ページロード時に質問を生成
        if (questions.length === 0) {
            generateQuestions();
        }
    }, [questions.length, generateQuestions]);

    const handleAnswerSubmit = async (answerText: string) => {
        try {
            const { feedback, followup } = await submitAnswer(answerText);
            setCurrentFeedback(feedback);
            setCurrentFollowup(followup);
            setFollowupFeedback(null);

            // 深掘り質問がない場合は「次の質問へ」ボタンを表示
            if (!followup || !followup.shouldFollowup) {
                setShowNextButton(true);
            }
        } catch (error) {
            console.error('Error submitting answer:', error);
        }
    };

    const handleFollowupAnswerSubmit = async (answerText: string) => {
        if (!currentFollowup?.followupQuestion) return;

        try {
            const feedback = await submitFollowupAnswer(currentFollowup.followupQuestion, answerText);
            setFollowupFeedback(feedback);
            setShowNextButton(true);
        } catch (error) {
            console.error('Error submitting followup answer:', error);
        }
    };

    const handleNextQuestion = () => {
        if (isInterviewComplete) {
            // 全質問完了したら結果画面へ
            router.push('/result');
        } else {
            nextQuestion();
            setCurrentFeedback(null);
            setCurrentFollowup(null);
            setFollowupFeedback(null);
            setShowNextButton(false);
        }
    };

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-red-50 border-2 border-red-200 rounded-xl p-6">
                    <h2 className="text-2xl font-bold text-red-900 mb-2">エラーが発生しました</h2>
                    <p className="text-red-700">{error}</p>
                    <Button onClick={() => router.push('/')} className="mt-4">
                        トップページに戻る
                    </Button>
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-xl text-gray-700">質問を生成中...</p>
                    <p className="text-sm text-gray-500 mt-2">少々お待ちください</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* ヘッダー */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">技術面接練習</h1>
                    <ProgressBar
                        current={currentQuestionIndex + 1}
                        total={questions.length}
                    />
                </div>

                <div className="space-y-6">
                    {/* 質問カード */}
                    {currentQuestion && (
                        <QuestionCard
                            question={currentQuestion}
                            questionNumber={currentQuestionIndex + 1}
                        />
                    )}

                    {/* フィードバックがまだない場合は回答フォームを表示 */}
                    {!currentFeedback && (
                        <AnswerForm
                            onSubmit={handleAnswerSubmit}
                            isLoading={isLoading}
                        />
                    )}

                    {/* フィードバック表示 */}
                    {currentFeedback && (
                        <FeedbackCard feedback={currentFeedback} />
                    )}

                    {/* 深掘り質問表示 */}
                    {currentFollowup && currentFollowup.shouldFollowup && currentFollowup.followupQuestion && !followupFeedback && (
                        <>
                            <FollowupQuestion
                                question={currentFollowup.followupQuestion}
                                intent={currentFollowup.intent}
                            />
                            <AnswerForm
                                onSubmit={handleFollowupAnswerSubmit}
                                isLoading={isLoading}
                            />
                        </>
                    )}

                    {/* 深掘り質問のフィードバック */}
                    {followupFeedback && (
                        <FeedbackCard feedback={followupFeedback} />
                    )}

                    {/* 次の質問へボタン */}
                    {showNextButton && (
                        <div className="flex justify-end">
                            <Button
                                onClick={handleNextQuestion}
                                size="lg"
                            >
                                {isInterviewComplete ? '結果を見る' : '次の質問へ'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
