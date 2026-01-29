'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SummaryCard } from '@/components/result/SummaryCard';
import { QuestionReview } from '@/components/result/QuestionReview';
import { Button } from '@/components/ui/Button';
import { Question, Answer } from '@/types/interview';

interface Summary {
    overallGrade: string;
    strengths: string[];
    areasToImprove: string[];
    advice: string;
    encouragement: string;
}

export default function ResultPage() {
    const router = useRouter();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // localStorageから面接データを取得（本来はcontextやstateから取得）
        // ここでは簡易的な実装として、面接終了時に保存したデータを読み込む想定
        const loadInterviewData = () => {
            try {
                const savedQuestions = localStorage.getItem('interview_questions');
                const savedAnswers = localStorage.getItem('interview_answers');

                if (savedQuestions && savedAnswers) {
                    const parsedQuestions = JSON.parse(savedQuestions);
                    const parsedAnswers = JSON.parse(savedAnswers);

                    setQuestions(parsedQuestions);
                    setAnswers(parsedAnswers);

                    // 総評を生成
                    generateSummary(parsedQuestions, parsedAnswers);
                } else {
                    // データがない場合はトップページへ
                    router.push('/');
                }
            } catch (error) {
                console.error('Error loading interview data:', error);
                router.push('/');
            }
        };

        loadInterviewData();
    }, [router]);

    const generateSummary = async (questions: Question[], answers: Answer[]) => {
        setIsLoading(true);

        try {
            const results = questions.map((q, i) => ({
                question: q.question,
                answer: answers[i]?.answerText || '',
                grade: answers[i]?.feedback?.grade || 'C',
                feedback: answers[i]?.feedback?.summary || '',
            }));

            const response = await fetch('/api/gemini/summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ results }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate summary');
            }

            const summaryData = await response.json();
            setSummary(summaryData);
        } catch (error) {
            console.error('Error generating summary:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading || !summary) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-xl text-gray-700">総評を生成中...</p>
                    <p className="text-sm text-gray-500 mt-2">少々お待ちください</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* ヘッダー */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">面接結果</h1>
                    <p className="text-gray-600">お疲れ様でした！以下が今回の面接の総評です。</p>
                </div>

                <div className="space-y-8">
                    {/* 総評カード */}
                    <SummaryCard
                        overallGrade={summary.overallGrade}
                        strengths={summary.strengths}
                        areasToImprove={summary.areasToImprove}
                        advice={summary.advice}
                        encouragement={summary.encouragement}
                    />

                    {/* 各質問の振り返り */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">各質問の振り返り</h2>
                        <div className="space-y-4">
                            {questions.map((question, index) => (
                                <QuestionReview
                                    key={question.id}
                                    question={question}
                                    answer={answers[index]}
                                    index={index}
                                />
                            ))}
                        </div>
                    </div>

                    {/* アクション */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 border-t">
                        <Link href="/">
                            <Button size="lg" variant="outline">
                                トップページに戻る
                            </Button>
                        </Link>
                        <Link href="/interview">
                            <Button size="lg">
                                もう一度練習する
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
