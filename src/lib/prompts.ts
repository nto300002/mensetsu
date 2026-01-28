// src/lib/prompts.ts

/**
 * Gemini APIへのプロンプトテンプレート
 */

// ポートフォリオ情報（実際はportfolio.tsからインポート）
// import { portfolioContent } from './portfolio';

/**
 * 1. 質問生成プロンプト
 * ポートフォリオ情報から6〜8問の技術質問を生成
 */
export const generateQuestionsPrompt = (portfolioContent: string) => `
あなたはWeb開発企業の技術面接官です。
以下のポートフォリオ情報を分析し、2次面接で聞くべき技術質問を生成してください。

## ポートフォリオ情報
${portfolioContent}

## 要件
- 6〜8問の質問を生成
- 質問のカテゴリをバランスよく配分:
  - アーキテクチャ・設計判断（2問）
  - 技術選定理由（2問）
  - 課題解決・トラブルシューティング（1-2問）
  - セキュリティ・パフォーマンス（1-2問）
- 各質問には専門用語を含める
- 質問は具体的で、ポートフォリオの内容に即したものにする
- 未経験者向けの面接を想定（基礎的な理解を確認する質問も含める）

## 出力形式
以下のJSON形式で出力してください。他の文章は含めないでください。

{
  "questions": [
    {
      "id": 1,
      "category": "アーキテクチャ・設計判断",
      "question": "質問文",
      "intent": "この質問で確認したいこと",
      "keywords": ["専門用語1", "専門用語2"],
      "expectedPoints": ["回答に含まれるべきポイント1", "ポイント2"],
      "terms": [
        {
          "term": "FastAPI",
          "reading": "ファストエーピーアイ"
        },
        {
          "term": "JWT",
          "reading": "ジェイダブリューティー"
        }
      ]
    }
  ]
}

注意: termsには質問文中に含まれる英数字の専門用語とその読み方（カタカナ）を含めてください。
`;

/**
 * 2. ふりがな・用語抽出プロンプト
 * 質問文から専門用語を抽出し、ふりがなと簡単な説明を付与
 */
export const extractTermsPrompt = (text: string) => `
以下のテキストから技術的な専門用語を抽出し、ふりがなと簡単な説明を付けてください。

## テキスト
${text}

## 要件
- プログラミング言語、フレームワーク、ライブラリ、技術概念を抽出
- 英語の用語にはカタカナ読みを付ける
- 説明は技術者でない人にもわかるように、30文字以内で簡潔に
- 一般的な日本語（「理由」「実装」など）は除外

## 出力形式
以下のJSON形式で出力してください。他の文章は含めないでください。

{
  "terms": [
    {
      "term": "FastAPI",
      "reading": "ファストエーピーアイ",
      "shortDescription": "Pythonの高速なWebフレームワーク"
    },
    {
      "term": "JWT",
      "reading": "ジェイダブリューティー",
      "shortDescription": "ログイン情報を安全にやり取りする仕組み"
    }
  ]
}
`;

/**
 * 3. 用語詳細解説プロンプト
 * 「これ何？」ボタン用の詳細解説
 */
export const explainTermPrompt = (term: string, context: string) => `
以下の専門用語について、技術者でない人にもわかるように説明してください。

## 用語
${term}

## 使用されている文脈
${context}

## 要件
- 比喩や例え話を使って説明
- 3〜5文程度で説明
- なぜ重要なのか、何のために使うのかを含める
- 専門用語を使う場合は、その用語も説明する

## 出力形式
以下のJSON形式で出力してください。他の文章は含めないでください。

{
  "term": "${term}",
  "explanation": "説明文",
  "analogy": "例え話や比喩（あれば）",
  "whyImportant": "なぜ重要か"
}
`;

/**
 * 4. 回答フィードバックプロンプト
 */
export const feedbackPrompt = (
    question: string,
    expectedPoints: string[],
    answer: string
) => `
あなたは技術面接の評価者です。
以下の質問に対する回答を評価し、フィードバックを生成してください。

## 質問
${question}

## 回答に含まれるべきポイント
${expectedPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

## 実際の回答
${answer}

## 要件
- 良かった点を具体的に挙げる
- 改善点を建設的に指摘する
- 不足しているポイントがあれば指摘
- 全体的な評価（A/B/C/D）を付ける
  - A: 十分な回答、ポイントを網羅
  - B: 概ね良い回答、一部不足
  - C: 基本は理解しているが説明が不十分
  - D: 理解が不足している
- 面接官役（技術者でない人）が読み上げられるよう、専門用語を避けて書く

## 出力形式
以下のJSON形式で出力してください。他の文章は含めないでください。

{
  "grade": "B",
  "goodPoints": ["良かった点1", "良かった点2"],
  "improvements": ["改善点1", "改善点2"],
  "missingPoints": ["不足しているポイント"],
  "summary": "全体的なコメント（2-3文）"
}
`;

/**
 * 5. 深掘り質問生成プロンプト
 */
export const followupPrompt = (
    originalQuestion: string,
    answer: string,
    portfolioContent: string
) => `
あなたは技術面接官です。
以下の質問と回答を踏まえ、深掘りするための追加質問を1つ生成してください。

## 元の質問
${originalQuestion}

## 回答
${answer}

## ポートフォリオ情報（参考）
${portfolioContent}

## 要件
- 回答の中で曖昧だった部分を明確にする質問
- または、回答から派生する関連技術についての質問
- 1問のみ生成
- 回答が十分で深掘りが不要な場合は、shouldFollowup: false を返す
- 質問には専門用語を含めてよい（後でふりがなを付ける）

## 出力形式
以下のJSON形式で出力してください。他の文章は含めないでください。

{
  "shouldFollowup": true,
  "followupQuestion": "深掘り質問",
  "intent": "この質問で確認したいこと",
  "keywords": ["専門用語1"]
}
`;

/**
 * 6. 総評生成プロンプト
 */
export const summaryPrompt = (
    results: Array<{
        question: string;
        answer: string;
        grade: string;
        feedback: string;
    }>
) => `
あなたは技術面接の評価者です。
以下の面接結果を総合的に評価し、総評を生成してください。

## 面接結果
${results
        .map(
            (r, i) => `
### 質問${i + 1}
質問: ${r.question}
回答: ${r.answer}
評価: ${r.grade}
フィードバック: ${r.feedback}
`
        )
        .join('\n')}

## 要件
- 全体的な強みを挙げる
- 全体的な改善点を挙げる
- 次のステップとしてのアドバイス
- 面接官役が読み上げられるよう、専門用語を避けて書く

## 出力形式
以下のJSON形式で出力してください。他の文章は含めないでください。

{
  "overallGrade": "B",
  "strengths": ["強み1", "強み2"],
  "areasToImprove": ["改善点1", "改善点2"],
  "advice": "次のステップへのアドバイス（2-3文）",
  "encouragement": "励ましのメッセージ（1文）"
}
`;