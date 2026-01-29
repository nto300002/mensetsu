import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Question } from '@/types/interview';
import { Modal } from '@/components/ui/Modal';

interface QuestionCardProps {
    question: Question;
    questionNumber: number;
}

export function QuestionCard({ question, questionNumber }: QuestionCardProps) {
    const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
    const [termExplanation, setTermExplanation] = useState<any>(null);
    const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);

    const handleExplainTerm = async (term: string) => {
        setSelectedTerm(term);
        setIsLoadingExplanation(true);

        try {
            const response = await fetch('/api/gemini/explain-term', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    term,
                    context: question.question,
                }),
            });

            const data = await response.json();
            setTermExplanation(data);
        } catch (error) {
            console.error('Error explaining term:', error);
        } finally {
            setIsLoadingExplanation(false);
        }
    };

    // 質問文に自動的にルビを振る関数
    const addRubyToQuestion = (text: string) => {
        if (!question.terms || question.terms.length === 0) {
            return text;
        }

        let processedText = text;

        // 専門用語を長い順にソート（部分一致を防ぐため）
        const sortedTerms = [...question.terms].sort((a, b) => b.term.length - a.term.length);

        sortedTerms.forEach(({ term, reading }) => {
            // 英数字を含む用語のみ対象
            if (/[a-zA-Z0-9]/.test(term)) {
                const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g');
                processedText = processedText.replace(
                    regex,
                    `<ruby>$1<rt>${reading}</rt></ruby>`
                );
            }
        });

        return processedText;
    };

    const questionWithRuby = addRubyToQuestion(question.question);

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>質問 {questionNumber}</CardTitle>
                        <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                            {question.category}
                        </span>
                    </div>
                </CardHeader>

                <CardContent>
                    <p
                        className="text-lg text-gray-800 mb-4 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: questionWithRuby }}
                    />

                    {question.keywords && question.keywords.length > 0 && (
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-600 mb-2">専門用語:</p>
                            <div className="flex flex-wrap gap-2">
                                {question.keywords.map((keyword, index) => (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleExplainTerm(keyword)}
                                    >
                                        {keyword} <span className="ml-1 text-xs">?</span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                            <span className="font-semibold">確認したいこと:</span> {question.intent}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* 用語解説モーダル */}
            <Modal
                isOpen={!!selectedTerm}
                onClose={() => {
                    setSelectedTerm(null);
                    setTermExplanation(null);
                }}
                title={`用語解説: ${selectedTerm}`}
            >
                {isLoadingExplanation ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">解説を生成中...</p>
                    </div>
                ) : termExplanation ? (
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">説明</h4>
                            <p className="text-gray-700 leading-relaxed">{termExplanation.explanation}</p>
                        </div>

                        {termExplanation.analogy && (
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">例え話</h4>
                                <p className="text-gray-700 leading-relaxed">{termExplanation.analogy}</p>
                            </div>
                        )}

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">なぜ重要か</h4>
                            <p className="text-gray-700 leading-relaxed">{termExplanation.whyImportant}</p>
                        </div>
                    </div>
                ) : null}
            </Modal>
        </>
    );
}
