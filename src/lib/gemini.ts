import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Gemini APIを使用してコンテンツを生成
 * @param prompt プロンプト文字列
 * @returns 生成されたテキスト
 */
export async function generateContent(prompt: string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return text;
}

/**
 * Gemini APIを使用してJSON形式のレスポンスを生成
 * @param prompt プロンプト文字列
 * @returns パースされたJSONオブジェクト
 */
export async function generateJSON<T>(prompt: string): Promise<T> {
    const text = await generateContent(prompt);

    // JSONブロックを抽出（```json ... ``` の形式に対応）
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    const jsonText = jsonMatch ? jsonMatch[1] : text;

    try {
        return JSON.parse(jsonText.trim()) as T;
    } catch (error) {
        console.error('Failed to parse JSON:', jsonText);
        throw new Error('Invalid JSON response from Gemini API');
    }
}
