import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface SummaryCardProps {
    overallGrade: string;
    strengths: string[];
    areasToImprove: string[];
    advice: string;
    encouragement: string;
}

export function SummaryCard({
    overallGrade,
    strengths,
    areasToImprove,
    advice,
    encouragement,
}: SummaryCardProps) {
    const getGradeColor = (grade: string) => {
        const gradeChar = grade.charAt(0);
        switch (gradeChar) {
            case 'A':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'B':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'C':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'D':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    return (
        <Card className="border-4 border-blue-300">
            <CardHeader>
                <div className="text-center">
                    <CardTitle className="text-3xl mb-4">総合評価</CardTitle>
                    <div className={`inline-block text-6xl font-bold px-8 py-4 rounded-xl border-4 ${getGradeColor(overallGrade)}`}>
                        {overallGrade}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* 励ましのメッセージ */}
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <p className="text-lg font-medium text-gray-800">{encouragement}</p>
                </div>

                {/* 全体的な強み */}
                {strengths.length > 0 && (
                    <div>
                        <h3 className="text-xl font-bold text-green-800 mb-3 flex items-center">
                            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            全体的な強み
                        </h3>
                        <ul className="space-y-3">
                            {strengths.map((strength, index) => (
                                <li key={index} className="flex items-start p-3 bg-green-50 rounded-lg">
                                    <span className="text-green-600 mr-3 text-xl">✓</span>
                                    <span className="text-gray-800 flex-1">{strength}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* 改善すべき点 */}
                {areasToImprove.length > 0 && (
                    <div>
                        <h3 className="text-xl font-bold text-orange-800 mb-3 flex items-center">
                            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                            </svg>
                            改善すべき点
                        </h3>
                        <ul className="space-y-3">
                            {areasToImprove.map((area, index) => (
                                <li key={index} className="flex items-start p-3 bg-orange-50 rounded-lg">
                                    <span className="text-orange-600 mr-3 text-xl">→</span>
                                    <span className="text-gray-800 flex-1">{area}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* アドバイス */}
                <div className="p-4 bg-blue-50 border-l-4 border-blue-600 rounded-lg">
                    <h3 className="text-lg font-bold text-blue-900 mb-2">次のステップ</h3>
                    <p className="text-gray-800 leading-relaxed">{advice}</p>
                </div>
            </CardContent>
        </Card>
    );
}
