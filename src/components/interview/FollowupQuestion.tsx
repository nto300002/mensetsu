import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';

interface FollowupQuestionProps {
    question: string;
    intent?: string;
}

export function FollowupQuestion({ question, intent }: FollowupQuestionProps) {
    return (
        <Card className="border-2 border-purple-200 bg-purple-50">
            <CardContent>
                <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-purple-900 mb-2">深掘り質問</h4>
                        <p className="text-gray-800 leading-relaxed mb-2">{question}</p>
                        {intent && (
                            <p className="text-sm text-purple-700">
                                <span className="font-medium">確認したいこと:</span> {intent}
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
