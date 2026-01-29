import { NextRequest, NextResponse } from 'next/server';
import { generateJSON } from '@/lib/gemini';
import { explainTermPrompt } from '@/lib/prompts';
import { TermExplanation } from '@/types/interview';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { term, context } = body;

        if (!term || !context) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const prompt = explainTermPrompt(term, context);
        const response = await generateJSON<TermExplanation>(prompt);

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error explaining term:', error);
        return NextResponse.json(
            { error: 'Failed to explain term' },
            { status: 500 }
        );
    }
}
