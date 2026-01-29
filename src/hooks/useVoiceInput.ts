'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseVoiceInputProps {
    onResult: (transcript: string, isFinal: boolean) => void;
    continuous?: boolean;
    language?: string;
}

export function useVoiceInput({
    onResult,
    continuous = true,
    language = 'ja-JP',
}: UseVoiceInputProps) {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);
    const onResultRef = useRef(onResult);
    const shouldBeListeningRef = useRef(false);
    const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // onResultの最新版を保持
    useEffect(() => {
        onResultRef.current = onResult;
    }, [onResult]);

    useEffect(() => {
        console.log('[useVoiceInput] Initializing...');

        // ブラウザがWeb Speech APIをサポートしているか確認
        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        console.log('[useVoiceInput] SpeechRecognition available:', !!SpeechRecognition);

        if (SpeechRecognition) {
            setIsSupported(true);
            const recognition = new SpeechRecognition();
            console.log('[useVoiceInput] Recognition instance created');

            // continuous を false にして、短いセッションで安定性を向上
            recognition.continuous = false; // 1つの発話ごとに終了
            recognition.interimResults = true; // 暫定結果も取得
            recognition.lang = language;
            recognition.maxAlternatives = 1; // 代替候補は1つ

            console.log('[useVoiceInput] Recognition configured - continuous:', recognition.continuous, 'lang:', recognition.lang);

            recognition.onstart = () => {
                console.log('[useVoiceInput] Recognition started');
                setIsListening(true);
                setError(null);
            };

            recognition.onresult = (event: any) => {
                console.log('[useVoiceInput] Recognition result received');
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                console.log('[useVoiceInput] Final:', finalTranscript, 'Interim:', interimTranscript);

                // 最終結果または暫定結果を返す
                if (finalTranscript) {
                    onResultRef.current(finalTranscript, true);
                } else if (interimTranscript) {
                    onResultRef.current(interimTranscript, false);
                }
            };

            recognition.onerror = (event: any) => {
                console.error('[useVoiceInput] Speech recognition error:', event.error);
                console.error('[useVoiceInput] Error details:', event);
                console.error('[useVoiceInput] Navigator online:', navigator.onLine);

                // エラーの種類に応じてメッセージを変更
                let errorMessage = '';
                let shouldStopListening = true;

                switch (event.error) {
                    case 'network':
                        errorMessage = 'ネットワークエラー: インターネット接続を確認してください。音声認識にはインターネット接続が必要です。';
                        shouldBeListeningRef.current = false; // 再起動しない
                        shouldStopListening = true;
                        break;
                    case 'not-allowed':
                        errorMessage = 'マイクの使用が許可されていません。ブラウザの設定を確認してください。';
                        shouldBeListeningRef.current = false; // 再起動しない
                        break;
                    case 'no-speech':
                        // no-speechの場合はエラーとして扱わず、自動再起動に任せる
                        console.log('[useVoiceInput] No speech detected, will auto-restart...');
                        return;
                    case 'aborted':
                        console.log('[useVoiceInput] Recognition aborted');
                        return;
                    case 'audio-capture':
                        errorMessage = 'マイクが見つかりません。マイクが接続されているか確認してください。';
                        shouldBeListeningRef.current = false;
                        break;
                    default:
                        errorMessage = `音声認識エラー: ${event.error}`;
                        shouldStopListening = false; // その他のエラーは再接続を試みる
                }

                setError(errorMessage);
                setIsListening(false);

                if (shouldStopListening) {
                    shouldBeListeningRef.current = false;
                }
            };

            recognition.onend = () => {
                console.log('[useVoiceInput] Recognition ended, shouldBeListen:', shouldBeListeningRef.current);
                setIsListening(false);

                // 継続モードで、ユーザーが停止していない場合は再起動
                if (shouldBeListeningRef.current) {
                    console.log('[useVoiceInput] Auto-restarting recognition...');
                    restartTimeoutRef.current = setTimeout(() => {
                        if (shouldBeListeningRef.current && recognitionRef.current) {
                            try {
                                recognitionRef.current.start();
                            } catch (error) {
                                console.error('[useVoiceInput] Failed to restart:', error);
                                setError('音声認識の再起動に失敗しました');
                                shouldBeListeningRef.current = false;
                            }
                        }
                    }, 500); // 500ms待ってから再起動（安定性向上）
                }
            };

            recognitionRef.current = recognition;
        }

        return () => {
            console.log('[useVoiceInput] Cleanup');
            shouldBeListeningRef.current = false;

            if (restartTimeoutRef.current) {
                clearTimeout(restartTimeoutRef.current);
                restartTimeoutRef.current = null;
            }

            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, [continuous, language]);

    const startListening = useCallback(() => {
        console.log('[useVoiceInput] startListening called, isListening:', isListening);
        console.log('[useVoiceInput] Network status - navigator.onLine:', navigator.onLine);

        // インターネット接続チェック
        if (!navigator.onLine) {
            console.error('[useVoiceInput] No internet connection detected');
            setError('インターネット接続がありません。音声認識にはインターネット接続が必要です。');
            return;
        }

        shouldBeListeningRef.current = true;
        setError(null);

        // 既存の再起動タイマーをクリア
        if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
            restartTimeoutRef.current = null;
        }

        if (recognitionRef.current && !isListening) {
            try {
                console.log('[useVoiceInput] Calling recognition.start()');
                recognitionRef.current.start();
            } catch (error) {
                console.error('[useVoiceInput] Failed to start recognition:', error);
                setError('音声認識の開始に失敗しました');
                shouldBeListeningRef.current = false;
            }
        } else {
            console.log('[useVoiceInput] Cannot start - recognitionRef:', !!recognitionRef.current, 'isListening:', isListening);
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        console.log('[useVoiceInput] stopListening called');
        shouldBeListeningRef.current = false;

        // 再起動タイマーをクリア
        if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
            restartTimeoutRef.current = null;
        }

        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (error) {
                console.error('[useVoiceInput] Failed to stop recognition:', error);
            }
        }
    }, []);

    const toggleListening = useCallback(() => {
        console.log('[useVoiceInput] toggleListening called, isListening:', isListening);
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }, [isListening, startListening, stopListening]);

    return {
        isListening,
        isSupported,
        error,
        startListening,
        stopListening,
        toggleListening,
    };
}
