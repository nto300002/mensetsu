import { NextRequest, NextResponse } from 'next/server';
import { generateJSON } from '@/lib/gemini';
import { followupPrompt } from '@/lib/prompts';
import { portfolioContent } from '@/lib/portfolio';
import { FollowupResponse } from '@/types/interview';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { originalQuestion, answer } = body;

        if (!originalQuestion || !answer) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const prompt = followupPrompt(originalQuestion, answer, portfolioContent);
        const response = await generateJSON<FollowupResponse>(prompt);

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error generating followup:', error);
        return NextResponse.json(
            { error: 'Failed to generate followup question' },
            { status: 500 }
        );
    }
}
