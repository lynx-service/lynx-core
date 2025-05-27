# プロジェクトガイドライン

## 指示
- あなたはプロのWebプログラマです。
- コンポーネントや関数は役割や責務に応じて適宜切り出してください。
- 不明点があったら作業を止めて質問してください。
- 保守しやすいように処理についてのコメントを残してください。

## サービス名
- LYNX

## サービス概要
ブロガーやアフィリエイター、自社のメディアサイトを運営しているWebマーケター向けのサイト管理ツールです。
主に記事同士の内部リンクの関係性を可視化・管理するためのツールです。

## システム構成
- フロントエンド
  - TypeScript
  - [ReactRouter v7](https://reactrouter.com/home)
  - [shadcn/ui](https://ui.shadcn.com/)
  - ReactHookForm
  - zod
  - react-icons
  - tailwindcss

- バックエンド
  - TypeScript
  - NestJS
  - Prisma
  - PostgreSQL

- スクレイピング用APIサーバー
  - Python
  - Scrapy
  - FastAPI

## 機能
### GoogleのOAuth認証
- Googleアカウントを利用したログイン・会員登録

### Webサイトのスクレイピングとコンテンツ情報の取得
- Webサイトの情報をスクレイピング・取得して編集・DBに保存する

### ダッシュボード
- DBから取得したWebサイトのコンテンツ情報の分析レポートを表示

### 内部リンク相関表
- 記事内の内部リンクの相関表をマップで表示し、視覚的にどの記事に内部リンクがある/ないのか判断する

## 実装方針
NestJSベストプラクティス要件
以下のベストプラクティスに従って実装してください:

**1. アーキテクチャとモジュール構成**

*   **モジュールの適切な分割**: 機能ごとに適切に分割されたモジュール構造（例: `ArticleModule`, `ProjectModule`）。
*   **SOLID原則の遵守**: 単一責任、開放/閉鎖、依存性逆転などの原則に従った設計。
*   **レイヤードアーキテクチャ**: **Controller**, **Usecase**, **Dao**, **Service** 層の明確な分離。
    *   **Controller**: HTTPリクエストの受付、リクエストデータの検証、Usecaseの呼び出し、レスポンスの返却を担当。
    *   **Usecase**: アプリケーション固有のビジネスロジックをカプセル化。単一のユースケースに特化した処理フローを担当。複数のDaoを組み合わせて処理を実行することもある。基本的に、1つのAPIに対して1つのUseCaseが存在する。
    *   **Dao (Data Access Object)**: Prisma Client を利用したデータベースとのインタラクションを抽象化。CRUD操作や特定のデータ取得クエリを担当。
    *   **Service**: 切り出して別Moduleから利用したい処理などを担当。（外部APIの連携etc）
*   **依存性注入**: コンストラクタ注入を基本とした適切な依存性注入パターン。
*   **モジュールの再利用**: 共通機能は独立したモジュール（例: `PrismaModule`, `AuthModule`）として実装し再利用。各機能モジュールは `imports` 配列に必要なモジュールを定義する。

**2. コントローラー設計**

*   **RESTful設計原則**: HTTPメソッドの適切な使用とリソース指向の設計。
*   **ルーティング**: 論理的かつ一貫性のあるエンドポイント命名と構造。
*   **リクエスト検証**: DTO（Data Transfer Object）と `class-validator`, `class-transformer` を用いた堅牢なリクエスト検証。
*   **レスポンス形式**: 標準化されたレスポンス形式（DTOを使用）と適切なHTTPステータスコード。
*   **エラーハンドリング**: グローバル例外フィルターを使用した一貫性のあるエラーレスポンス。
*   **ペイロードサイズ**: リクエストペイロードのサイズは `50mb` を上限とする (`main.ts` で設定)。

**3. Usecase層実装**

*   **ビジネスロジックのカプセル化**: **Usecase** レイヤーにビジネスロジックを集中。
*   **トランザクション管理**: 必要な場合、Prismaのトランザクション機能を利用して、複数のデータ操作の原子性を保証する。
*   **依存関係の最小化**: Usecaseは担当するビジネスロジックに必要なDaoや他のUsecaseのみに依存する。
*   **ドメイン駆動設計**: 複雑なドメインロジックにはDDDの概念（エンティティ、値オブジェクトなど）を意識した設計を検討。
*   **副作用の最小化**: 純粋なロジックと副作用を持つ処理（DBアクセス、外部API呼び出しなど）の分離を意識する。

**4. データアクセスパターン**

*   **Daoパターン**: データアクセス処理を **Dao** に隠蔽。Daoは特定のエンティティに対するデータ操作のインターフェースを提供する。
*   **Prisma Clientの活用**: Dao層ではPrisma Clientを効果的に使用し、型安全なデータアクセスを実現する。
*   **クエリ最適化**: N+1問題を回避するためのPrismaの `include` や `select` の適切な使用、効率的なクエリ設計を心がける。
*   **マイグレーション戦略**: Prisma Migrate を利用した安全かつ再現可能なデータベースマイグレーション。
*   **スキーマ設計**: `prisma/schema.prisma` における適切なリレーション定義とインデックス設定。

**5. 認証と認可**

*   **セキュアなJWT実装**: NestJSの `@nestjs/jwt` を利用し、適切な有効期限、更新戦略、署名アルゴリズムを設定。
*   **ロールベースのアクセス制御 (RBAC)**: Guard (例: `JwtAuthGuard`) や Decorator (例: `@Public()`) を活用した柔軟なアクセス制御。
*   **セキュリティのベストプラクティス**: XSS, CSRF対策、レート制限の実装を検討。
*   **認証情報保護**: パスワードハッシュ化（bcryptなど）と機密情報の適切な保護。
*   **OAuth/OIDC統合**: Google OAuth2.0認証 (例: `GoogleStrategy`) のようなサードパーティ認証の適切な統合。

**6. バリデーションと例外処理**

*   **入力バリデーション**: DTOと `class-validator`, `class-transformer` を活用した堅牢な検証。**グローバルに `ValidationPipe` を適用** (`main.ts` で設定)。
*   **例外フィルター**: カスタム例外とグローバル例外フィルター (`@nestjs/common` の `HttpException` やカスタム例外クラス) による統一的なエラーハンドリング。
*   **ロギング戦略**: 例外発生時や重要な処理ポイントでの適切なロギング（NestJS標準の `Logger` や外部ライブラリ）。
*   **優雅な障害処理**: 部分的な障害に対する堅牢性とフォールバックを検討。
*   **バリデーションパイプ**: グローバル (`main.ts` で `useGlobalPipes`) およびエンドポイント固有のバリデーションパイプの適切な活用。

**7. パフォーマンスと最適化**

*   **キャッシュ活用**: 必要に応じて `@nestjs/cache-manager` やインターセプターによるレスポンスキャッシュを検討。
*   **非同期処理最適化**: Promiseベースの非同期処理を適切に管理。大量のバックグラウンドタスクには `BullModule` などのキューイングシステムを検討。
*   **データベース最適化**: インデックス活用、効率的なクエリ設計、コネクションプーリング（Prismaが管理）。
*   **メモリ管理**: 大きなペイロード処理時のストリーミングやメモリ使用量の考慮。
*   **水平スケーリング**: ステートレスサービス設計によるスケーリング対応。

**8. テスト戦略**

*   **ユニットテスト**: Usecase層、Dao層、Controller層のロジックに対する単体テスト (Jestを使用)。
*   **統合テスト**: 複数のモジュールや外部サービス（DBなど）を連携させたテスト。
*   **E2Eテスト**: APIエンドポイントに対するエンドツーエンドテスト (`supertest` を使用)。
*   **テスト分離**: テスト間の依存関係を最小化する設計。
*   **テストデータ管理**: 再現可能なテストデータセットアップ。Prismaのシーディング機能などを活用。
*   **モック活用**: 外部依存（他のモジュール、DBアクセスなど）のモックと適切なテスト環境設定。

**9. 構成と環境管理**

*   **ConfigService活用**: `@nestjs/config` の `ConfigModule` と `ConfigService` を使用した環境変数管理。
*   **環境分離**: `.env` ファイル (例: `.env.development`, `.env.production`) を用いた開発、テスト、本番環境の適切な分離。
*   **シークレット管理**: 機密情報（APIキー、DBパスワードなど）の安全な管理。
*   **ロギング戦略**: 構造化ロギングと環境に応じた適切なログレベル設定。
*   **ヘルスチェック**: 本番環境監視のためのヘルスチェックエンドポイント (`@nestjs/terminus` などを検討)。
*   **CORS設定**: `main.ts` で設定。許可するオリジンは環境変数 `FRONTEND_URL` で制御し、本番環境または未設定の場合は `'https://lynx-frontend.onrender.com'` にフォールバックする。`credentials: true` を設定。

**10. コード品質と保守性**

*   **リンター/フォーマッター**: ESLint, Prettierによる一貫したコードスタイル。設定ファイル (`.eslintrc.js`, `.prettierrc`) に従う。
    *   **ESLint**: `@typescript-eslint/recommended` と `plugin:prettier/recommended` を基本設定とする。以下のルールは意図的に無効化 (`off`) されている。
        *   `@typescript-eslint/interface-name-prefix`
        *   `@typescript-eslint/explicit-function-return-type`
        *   `@typescript-eslint/explicit-module-boundary-types`
        *   `@typescript-eslint/no-explicit-any`
    *   **Prettier**:
        *   `singleQuote: true` (文字列はシングルクォートを使用)
        *   `trailingComma: "all"` (オブジェクトや配列の末尾には常にカンマを付与)
*   **自動ドキュメント**: Swagger (`@nestjs/swagger`) を使用したAPIドキュメンテーションの自動生成。
*   **モジュール境界の明確化**: 各モジュールの `exports` 配列で公開するコンポーネントを適切に管理し、カプセル化を意識する。
*   **命名規則の一貫性**:
    *   **ファイル名**: ケバブケース (`entity-name.layer-type.ts` 例: `list-minimal-articles-by-project.usecase.ts`, `article.controller.ts`)。
    *   **クラス名**: パスカルケース。
        *   モジュール: `XxxxModule` (例: `ArticleModule`)
        *   コントローラー: `XxxxController` (例: `ArticleController`)
        *   Usecase: `VerbNounUsecase` または `ActionEntityUsecase` (例: `ListMinimalArticlesByProjectUsecase`, `CreateProjectUsecase`)
        *   Dao: `XxxxDao` (例: `ArticleDao`)
        *   DTO: `VerbNounDto` (例: `CreateProjectDto`), `EntityResponseDto` (例: `ProjectResponseDto`), `UpdateEntityDto` (例: `UpdateKeywordDto`)
    *   **関数/メソッド名**: キャメルケース。
    *   **変数名**: キャメルケース。
    *   **定数名**: アッパースネークケース (例: `MAX_USERS`)。
*   **コメントと文書化**: 複雑なロジックや公開APIにはJSDoc形式などで適切なコメントを記述する。
