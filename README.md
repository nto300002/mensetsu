# Tech Interview Trainer（技術面接練習アプリ）

技術のわからない人が面接官役になって、エンジニア志望者の技術面接練習を支援するアプリ

## 概要

ポートフォリオ情報を元にAIが技術質問を生成し、回答に対するフィードバックと深掘り質問を提供します。専門用語にはふりがなと解説が表示されるため、技術に詳しくない人でも面接官役を務められます。

## 主要機能

### MVP

| 機能 | 説明 |
|------|------|
| 質問生成 | ポートフォリオ情報から6〜8問の技術質問を生成 |
| ふりがな表示 | 専門用語にカーソルホバーで読み方を表示 |
| 用語解説 | 「これ何？」ボタンで専門用語の意味をポップアップ表示 |
| 深掘り質問 | 回答内容に応じてAIが追加の技術質問を生成 |
| フィードバック | 回答に対する評価・改善点を表示 |
| 結果サマリー | 全問終了後に総評を表示 |

### 将来拡張

| 機能 | 説明 |
|------|------|
| 履歴保存 | 練習履歴をDBに保存 |
| ユーザー認証 | Google OAuthでログイン |
| 複数ポートフォリオ | 複数のプロジェクトを登録・切り替え |

## 技術スタック

### MVP

| レイヤー | 技術 |
|---------|------|
| フロントエンド | Next.js 15 (App Router), TypeScript |
| スタイリング | Tailwind CSS |
| AI | Gemini API |
| 状態管理 | React state / useContext |
| デプロイ | Vercel |

### 将来拡張

| レイヤー | 技術 |
|---------|------|
| データベース | Neon (PostgreSQL) |
| ORM | Prisma |
| 認証 | NextAuth.js + Google OAuth |

## 画面構成

```
1. トップページ (/)
   - アプリ説明
   - 「面接練習を始める」ボタン

2. 面接練習画面 (/interview)
   - 質問表示（ふりがな付き）
   - 「これ何？」ボタン
   - 回答入力エリア
   - フィードバック表示
   - 深掘り質問表示
   - 進捗表示（1/8）

3. 結果画面 (/result)
   - 総評
   - 各質問の回答・評価一覧
   - 「もう一度練習する」ボタン
```

## ディレクトリ構成

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                 # トップページ
│   ├── interview/
│   │   └── page.tsx             # 面接練習画面
│   ├── result/
│   │   └── page.tsx             # 結果画面
│   └── api/
│       └── gemini/
│           ├── generate-questions/
│           │   └── route.ts     # 質問生成API
│           ├── feedback/
│           │   └── route.ts     # フィードバック生成API
│           ├── followup/
│           │   └── route.ts     # 深掘り質問生成API
│           └── explain-term/
│               └── route.ts     # 用語解説API
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── ProgressBar.tsx
│   │   └── Textarea.tsx
│   ├── interview/
│   │   ├── QuestionCard.tsx     # 質問表示（ふりがな付き）
│   │   ├── AnswerForm.tsx       # 回答入力フォーム
│   │   ├── FeedbackCard.tsx     # フィードバック表示
│   │   ├── FollowupQuestion.tsx # 深掘り質問表示
│   │   └── TermTooltip.tsx      # 専門用語ツールチップ
│   └── result/
│       ├── SummaryCard.tsx      # 総評表示
│       └── QuestionReview.tsx   # 各質問の振り返り
├── lib/
│   ├── gemini.ts                # Gemini APIクライアント
│   ├── prompts.ts               # プロンプトテンプレート
│   └── portfolio.ts             # ポートフォリオデータ
├── hooks/
│   └── useInterview.ts          # 面接状態管理
├── types/
│   └── interview.ts             # 型定義
└── data/
    └── portfolio.md             # ポートフォリオ情報
```

## 環境変数

```bash
# .env.local
GEMINI_API_KEY=your_gemini_api_key
```

## セットアップ

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build
```

## ユーザーフロー

```
1. トップページでアプリ説明を確認
   ↓
2. 「面接練習を始める」をクリック
   ↓
3. AIが質問を生成（ローディング表示）
   ↓
4. 質問が表示される
   - 専門用語にホバー → ふりがな表示
   - 「これ何？」クリック → 用語解説モーダル
   ↓
5. 面接官役が質問を読み上げる
   ↓
6. 回答者が口頭で回答、面接官役が要約を入力
   ↓
7. 「回答する」をクリック
   ↓
8. フィードバックと深掘り質問が表示
   ↓
9. 深掘り質問があれば続ける（5-8を繰り返し）
   ↓
10. 「次の質問へ」で次の質問に進む（4-9を繰り返し）
   ↓
11. 全問終了後、結果画面で総評を確認
```

## ライセンス

MIT# mensetsu
