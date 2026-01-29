import { NextResponse } from 'next/server';
import { generateJSON } from '@/lib/gemini';
import { generateQuestionsPrompt } from '@/lib/prompts';
import { portfolioContent } from '@/lib/portfolio';
import { Question } from '@/types/interview';

interface GenerateQuestionsResponse {
    questions: Question[];
}

export async function POST() {
    try {
        const prompt = generateQuestionsPrompt(portfolioContent);
        const response = await generateJSON<GenerateQuestionsResponse>(prompt);

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error generating questions:', error);
        return NextResponse.json(
            { error: 'Failed to generate questions' },
            { status: 500 }
        );
    }
}
