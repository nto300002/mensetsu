import { NextRequest, NextResponse } from 'next/server';
import { generateJSON } from '@/lib/gemini';
import { summaryPrompt } from '@/lib/prompts';

interface SummaryRequest {
    results: Array<{
        question: string;
        answer: string;
        grade: string;
        feedback: string;
    }>;
}

interface Summary {
    overallGrade: string;
    strengths: string[];
    areasToImprove: string[];
    advice: string;
    encouragement: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: SummaryRequest = await request.json();
        const { results } = body;

        if (!results || !Array.isArray(results)) {
            return NextResponse.json(
                { error: 'Missing or invalid results' },
                { status: 400 }
            );
        }

        const prompt = summaryPrompt(results);
        const response = await generateJSON<Summary>(prompt);

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error generating summary:', error);
        return NextResponse.json(
            { error: 'Failed to generate summary' },
            { status: 500 }
        );
    }
}
