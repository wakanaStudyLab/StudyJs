# Modern JavaScript & TypeScript Crash Course (For Rust, C#, Go, Java, Python Developers)

Rust, C#, Go, Java, Python などの言語を習得済みのエンジニアが、**最短でモダン JavaScript / TypeScript (ES2022+ / TS 5.x / Node.js 22+) をマスターするための実践リファレンス**です。

---

## 🚀 クイックスタート (実行方法)

```powershell
cd C:\Users\harun\programming\js\sample

# 初回のみ依存関係をインストール (tsx, typescript など)
npm install

# 全モジュールを一括実行
npm start

# または付属スクリプトで実行
.\run.ps1

# 各モジュールを単体実行
npm run run:01   # 01: 型システム・構造的型付け・Generics
npm run run:02   # 02: 制御構文・配列パイプライン・Immutability
npm run run:03   # 03: 非同期処理・イベントループ・Promise
npm run run:04   # 04: クラス・thisの罠・プライベートフィールド
```

---

## 🗺️ 言語対比マッピング早見表 (TypeScript vs Rust vs C# vs Go vs Java vs Python)

| 概念・機能 | Modern TypeScript (5.x) | Rust | C# | Go | Java | Python (3.10+) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **型付け体系** | **構造的型付け (Duck)** | 公称型 (Nominal) | 公称型 (Nominal) | 構造的 (Interface) | 公称型 (Nominal) | 動的 + 型ヒント |
| **Nullable / 空** | `T \| null \| undefined` | `Option<T>` | `T?` | `*T` / `nil` | `Optional<T>` | `T \| None` |
| **代数的データ型 (ADT)** | **Discriminated Union** | `enum Name { A, B }` | `abstract record` | `interface` | `sealed interface` | `TypeA \| TypeB` |
| **パターンマッチング** | `switch (val.type)` | `match val { ... }` | `val switch { ... }` | `switch val.(type)`| `switch (val)` | `match val: case:` |
| **コレクション操作** | `.map().filter().reduce()` | `.iter().filter().map()` | LINQ `.Where().Select()` | slices / ループ | Stream `.filter().map()` | 内包表記 `[x for ...]` |
| **等価性比較** | `===` (厳格) / `Object.is`| `a == b` | `a.Equals(b)` / `==` | `a == b` | `a.equals(b)` | `a == b` / `is` |
| **非同期 Promise** | `Promise<T>` / `await` | `tokio async` | `Task<T>` / `await` | goroutine + channel | `CompletableFuture` | `asyncio.Task` / `await` |
| **並行実行モデル** | **Single Thread + Event Loop** | OS スレッド / async | OS スレッド / async | goroutine (M:N) | Virtual Threads (M:N)| Event Loop / Multi-Proc |
| **リソース解放** | `using const x = ...` (TS 5.2+) | `Drop` トレイト | `using (var x = ...)` | `defer x.Close()` | `try (var x = ...)` | `with x as f:` |

---

## ⚠️ 他言語経験者が最もハマる JavaScript / TypeScript の「罠」と作法

### 1. `==` (緩い等価) は絶対に使わず、常に `===` (厳格等価) を使う
- **理由**: `==` は暗黙の型変換（Type Coercion）を行い、予期せぬ重大なバグの原因になります。
  ```typescript
  // ❌ 危険な挙動 (==)
  0 == ""            // true (数値を文字列に変換して比較してしまう)
  false == 0         // true
  null == undefined  // true

  // ⭕ 正しい比較 (===)
  0 === ""           // false (型が異なるため即座に false)
  null === undefined // false
  ```

### 2. `null` vs `undefined` の使い分け
- `undefined`: 変数が宣言されたが値が代入されていない状態（言語組み込みのデフォルト値）。
- `null`: 「意図的に値が存在しない」ことを開発者が明示的にセットした状態。
- **Modern TS のベストプラクティス**: 基本的には `undefined` で統一し、オプショナルチェイニング `?.` や Null合体演算子 `??` を活用する。

### 3. `??` (Null合体) と `||` (論理OR) の致命的な違い
- `||` は、数値の `0` や空文字 `""`、`false` も「falsy」とみなして右辺のデフォルト値を採用してしまいます。
  ```typescript
  const count = 0;
  const a = count || 10;   // ❌ 10 (0 が有効な値なのに 10 に上書きされる)
  const b = count ?? 10;   // ⭕ 0 (null または undefined のときだけ 10 を採用)
  ```

### 4. `this` バインディングの喪失とアロー関数 (`() => {}`)
- JavaScript のメソッド呼び出しにおいて、`this` は「定義された場所」ではなく **「どこから呼ばれたか（呼び出し元）」** で決まります。
- コールバック関数としてメソッドを渡すと `this` が `undefined` になりクラッシュします。
- **解決策**: コールバックとして渡すメソッドは、クラスのプロパティとして **アロー関数** で定義する（`myMethod = () => { ... }`）。

### 5. 構造的型付け (Structural Typing) の落とし穴
- TypeScript は Java や C# のような「クラス名で型を判定する公称型」ではなく、**「プロパティの形が合っていれば同一型とみなす構造的型付け」** を採用しています。
  ```typescript
  interface Point2D { x: number; y: number; }
  interface Vector3D { x: number; y: number; z: number; }

  function drawPoint(p: Point2D) { ... }

  const v: Vector3D = { x: 1, y: 2, z: 3 };
  drawPoint(v); // ⭕ エラーにならない！ (Point2D に必要な x, y を満たしているため)
  ```

---

## 📁 提供サンプルコードの解説

| ファイル | テーマ | 主な学習内容 |
| :--- | :--- | :--- |
| [`01_types_and_generics.ts`](file:///C:/Users/harun/programming/js/sample/src/01_types_and_generics.ts) | **型システム & Generics** | 構造的型付け, Discriminated Union (代数的データ型), 型ガード (`is`), `unknown` vs `any`, `Readonly<T>`, `Partial<T>` |
| [`02_control_and_immutability.ts`](file:///C:/Users/harun/programming/js/sample/src/02_control_and_immutability.ts) | **配列パイプライン & 不変操作** | `.map()/.filter()/.reduce()`, `?.` (Optional Chaining), `??` (Nullish), `===` vs `==`, `structuredClone()` (ディープコピー) |
| [`03_async_and_eventloop.ts`](file:///C:/Users/harun/programming/js/sample/src/03_async_and_eventloop.ts) | **非同期 & イベントループ** | Event Loop (Microtask vs Macrotask), `Promise.all()` vs `Promise.allSettled()`, `AbortController` (キャンセル制御) |
| [`04_classes_and_modules.ts`](file:///C:/Users/harun/programming/js/sample/src/04_classes_and_modules.ts) | **クラス & thisの罠** | クラス構文, `#privateField` (真のカプセル化), `this` バインディング問題の完全回避, 静的メソッド, ES Modules |
| [`main.ts`](file:///C:/Users/harun/programming/js/sample/src/main.ts) | **統合エントリーポイント** | 全モジュールを一括実行するランナー |

---

## ⚙️ VS Code での TypeScript 開発設定ガイド (`launch.json` & `settings.json`)

VS Code で TypeScript コードを快適に「単体実行」「F5 デバッグ」「型補完」するための設定マニュアルです。

---

### 1. `launch.json` の書き方とプロパティ解説 (デバッグ起動設定)

`.vscode/launch.json` は **`F5`** キーを押したときのデバッグ動作を定義するファイルです。

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            // ① 【デフォルト】現在アクティブに開いているタブの TS ファイルを単体実行
            // (01_... や 02_... を開いて F5 を押すとそのファイルだけが即座にデバッグ起動)
            "name": "▶ TypeScript: Current File",
            "type": "node",
            "request": "launch",
            "runtimeExecutable": "npx",
            "runtimeArgs": ["tsx", "${file}"],
            "console": "integratedTerminal",
            "cwd": "${fileDirname}",
            "skipFiles": ["<node_internals>/**", "**/node_modules/**"]
        },
        {
            // ② 統合エントリーポイント (main.ts) を実行して全モジュールを一括検証
            "name": "▶ TypeScript: Run main.ts (All Modules)",
            "type": "node",
            "request": "launch",
            "runtimeExecutable": "npx",
            "runtimeArgs": ["tsx", "${workspaceFolder}/src/main.ts"],
            "console": "integratedTerminal",
            "cwd": "${workspaceFolder}",
            "skipFiles": ["<node_internals>/**", "**/node_modules/**"]
        }
    ]
}
```

#### 🔑 主要プロパティ一覧表

| プロパティ | 役割 | 指定例 / 選択肢 |
| :--- | :--- | :--- |
| **`type`** | デバッガーの種類 | `"node"` (Node.js 標準デバッガー) |
| **`request`** | 実行方式 | `"launch"` (新規起動) / `"attach"` (既存プロセス接続) |
| **`runtimeExecutable`**| 実行コマンド | `"npx"` (Node パッケージランナー) |
| **`runtimeArgs`** | ランタイム引数 | `["tsx", "${file}"]` (事前ビルドなしで TS を即座に直接実行) |
| **`console`** | 出力先コンソール | `"integratedTerminal"` (標準ターミナル / 推奨) |
| **`skipFiles`** | デバッグ時にステップインをスキップする領域 | `["<node_internals>/**", "**/node_modules/**"]` (Node内部や外部ライブラリを飛ばす) |
| **`cwd`** | 実行時作業ディレクトリ | `"${fileDirname}"` (開いているファイルの場所) / `"${workspaceFolder}"` |

---

### 2. `settings.json` の書き方とプロパティ解説 (ワークスペース設定)

`.vscode/settings.json` は、プロジェクトローカルの TypeScript バージョン指定や自動補完を制御します。

```json
{
    // プロジェクト内の最新 TypeScript (node_modules/typescript) を使用
    "typescript.tsdk": "node_modules/typescript/lib",
    "typescript.enablePromptUseWorkspaceTsdk": true,

    // 自動インポート補完
    "typescript.suggest.autoImports": true,
    "javascript.suggest.autoImports": true,

    // ファイルエンコーディング (UTF-8)
    "files.encoding": "utf8",

    // 保存時の不要な空白削除と末尾改行
    "files.trimTrailingWhitespace": true,
    "files.insertFinalNewline": true
}
```
