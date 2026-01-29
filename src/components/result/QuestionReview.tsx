import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Question, Answer } from '@/types/interview';

interface QuestionReviewProps {
    question: Question;
    answer: Answer;
    index: number;
}

export function QuestionReview({ question, answer, index }: QuestionReviewProps) {
    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'A':
                return 'bg-green-100 text-green-800';
            case 'B':
                return 'bg-blue-100 text-blue-800';
            case 'C':
                return 'bg-yellow-100 text-yellow-800';
            case 'D':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>質問 {index + 1}</CardTitle>
                    {answer.feedback && (
                        <span className={`text-xl font-bold px-3 py-1 rounded-lg ${getGradeColor(answer.feedback.grade)}`}>
                            {answer.feedback.grade}
                        </span>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* 質問 */}
                <div>
                    <h4 className="font-semibold text-gray-700 mb-2">質問</h4>
                    <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{question.question}</p>
                </div>

                {/* 回答 */}
                <div>
                    <h4 className="font-semibold text-gray-700 mb-2">あなたの回答</h4>
                    <p className="text-gray-800 bg-blue-50 p-3 rounded-lg">{answer.answerText}</p>
                </div>

                {/* フィードバック */}
                {answer.feedback && (
                    <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-700 mb-2">フィードバック</h4>
                        <p className="text-gray-700 mb-3">{answer.feedback.summary}</p>

                        {answer.feedback.goodPoints.length > 0 && (
                            <div className="mb-3">
                                <p className="text-sm font-semibold text-green-700 mb-1">良かった点:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    {answer.feedback.goodPoints.map((point, i) => (
                                        <li key={i} className="text-sm text-gray-700">{point}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {answer.feedback.improvements.length > 0 && (
                            <div>
                                <p className="text-sm font-semibold text-blue-700 mb-1">改善点:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    {answer.feedback.improvements.map((point, i) => (
                                        <li key={i} className="text-sm text-gray-700">{point}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* 深掘り質問があれば表示 */}
                {answer.followupQuestions && answer.followupQuestions.length > 0 && (
                    <div className="border-t pt-4">
                        <h4 className="font-semibold text-purple-700 mb-2">深掘り質問と回答</h4>
                        {answer.followupQuestions.map((followup, i) => (
                            <div key={i} className="mb-3 p-3 bg-purple-50 rounded-lg">
                                <p className="text-sm font-medium text-purple-900 mb-1">Q: {followup.question}</p>
                                {followup.answer && (
                                    <p className="text-sm text-gray-700">A: {followup.answer}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
