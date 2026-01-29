import React, { useState, useCallback } from 'react';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useVoiceInput } from '@/hooks/useVoiceInput';

interface AnswerFormProps {
    onSubmit: (answer: string) => void;
    isLoading: boolean;
}

export function AnswerForm({ onSubmit, isLoading }: AnswerFormProps) {
    const [answer, setAnswer] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');

    const handleVoiceResult = useCallback((transcript: string, isFinal: boolean) => {
        console.log('[AnswerForm] handleVoiceResult called, transcript:', transcript, 'isFinal:', isFinal);
        if (isFinal) {
            // 最終結果の場合は、テキストエリアに追加
            setAnswer(prevAnswer => {
                // 既存のテキストの最後に改行がある場合はそのまま、なければスペースを追加
                const separator = prevAnswer && !prevAnswer.endsWith('\n') && !prevAnswer.endsWith(' ') ? ' ' : '';
                return prevAnswer + separator + transcript;
            });
            setInterimTranscript('');
        } else {
            // 暫定結果の場合は、プレビューとして表示
            setInterimTranscript(transcript);
        }
    }, []);

    const { isListening, isSupported, error, toggleListening } = useVoiceInput({
        onResult: handleVoiceResult,
        continuous: true,
        language: 'ja-JP',
    });

    const handleToggleListening = () => {
        console.log('[AnswerForm] handleToggleListening called, isListening:', isListening, 'isSupported:', isSupported);
        if (isListening) {
            // 停止時に暫定結果をクリア
            setInterimTranscript('');
        }
        toggleListening();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (answer.trim()) {
            onSubmit(answer.trim());
            setAnswer('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                {/* ラベルと音声入力ボタン */}
                <div className="flex items-center gap-3 mb-2">
                    {/* 音声入力ボタン */}
                    {isSupported && (
                        <button
                            type="button"
                            onClick={handleToggleListening}
                            disabled={isLoading}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isListening
                                    ? 'bg-red-500 text-white animate-pulse'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            {isListening ? '音声入力中' : '音声入力'}
                        </button>
                    )}

                    <label className="block text-sm font-medium text-gray-700">
                        回答を入力してください
                    </label>
                </div>

                <Textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="面接官が応募者の回答を要約して入力します..."
                    rows={6}
                    disabled={isLoading}
                />
            </div>

            {/* 音声認識のステータス表示 */}
            {isListening && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-red-600">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        音声入力中...
                    </div>
                    {interimTranscript && (
                        <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded text-sm text-gray-700">
                            <span className="font-semibold text-blue-700">認識中: </span>
                            {interimTranscript}
                        </div>
                    )}
                </div>
            )}

            {/* エラー表示 */}
            {error && (
                <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <p className="text-sm font-semibold text-red-800">音声認識エラー</p>
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-600">
                        {answer.length} 文字
                    </p>
                    {!isSupported && (
                        <p className="text-xs text-gray-500">
                            ※ お使いのブラウザは音声入力に対応していません
                        </p>
                    )}
                </div>
                <Button
                    type="submit"
                    disabled={!answer.trim() || isLoading}
                    size="lg"
                >
                    {isLoading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 inline-block"></div>
                            評価中...
                        </>
                    ) : (
                        '回答を送信'
                    )}
                </Button>
            </div>
        </form>
    );
}
