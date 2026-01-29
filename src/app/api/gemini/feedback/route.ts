import { NextRequest, NextResponse } from 'next/server';
import { generateJSON } from '@/lib/gemini';
import { feedbackPrompt } from '@/lib/prompts';
import { Feedback } from '@/types/interview';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { question, expectedPoints, answer } = body;

        if (!question || !expectedPoints || !answer) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const prompt = feedbackPrompt(question, expectedPoints, answer);
        const response = await generateJSON<Feedback>(prompt);

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error generating feedback:', error);
        return NextResponse.json(
            { error: 'Failed to generate feedback' },
            { status: 500 }
        );
    }
}
