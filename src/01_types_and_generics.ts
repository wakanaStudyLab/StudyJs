/**
 * ============================================================================
 * TypeScript 01: 型システム・構造的型付け・ジェネリクス (Type System & Generics)
 * ============================================================================
 * 
 * 【他言語経験者（Rust, C#, Go, Java, Python）向け要点】
 * 1. 構造的型付け (Structural Subtyping / Duck Typing):
 *    - Java / C# / Rust などの「公称型 (Nominal Typing)」とは異なり、
 *      TS は「プロパティの形（Shape）が合っていれば同じ型」と判定します。
 *    - Go のインターフェース暗黙実装に近い概念です。
 * 
 * 2. null vs undefined の決定的な違い:
 *    - `undefined`: 変数が宣言されたが値が代入されていない状態（未定義 / デフォルト）。
 *    - `null`: 「意図的に値が存在しない」ことを明示的にセットした状態。
 * 
 * 3. Union型 (|) と Discriminated Union (代数的データ型 / 直和型):
 *    - Rustの `enum`、Javaの `sealed interface`、Pythonの `TypeA | TypeB` に相当。
 *    - 共通のタグ（`type` や `kind`）を持つオブジェクト群を安全に網羅分岐できます。
 * 
 * 4. any vs unknown vs never:
 *    - `any`: 型チェックを完全に無効化（使用禁止推奨）。
 *    - `unknown`: 「何が入るか不明な型」。型ガードで絞り込むまでプロパティアクセス不能（型安全）。
 *    - `never`: 「決して発生しない型」。網羅性チェック (Exhaustiveness check) に使用。
 * 
 * 5. 組み込み Utility Types:
 *    - `Readonly<T>` (イミュータブル化), `Partial<T>` (全プロパティをオプショナル化),
 *      `Record<K, V>` (Map型), `Pick<T, K>` (特定の型プロパティのみ抽出)。
 */

// ============================================================================
// 1. 構造的型付け (Structural Typing)
// ============================================================================
interface Point2D {
  x: number;
  y: number;
}

interface NamedPoint {
  x: number;
  y: number;
  name: string;
}

function calculateDistanceFromOrigin(p: Point2D): number {
  return Math.sqrt(p.x * p.x + p.y * p.y);
}

// ============================================================================
// 2. Discriminated Union (判別可能な直和型 / 代数的データ型)
// ============================================================================
interface CreditCardPayment {
  type: "credit_card"; // リテラル型 (判別タグ)
  cardNumber: string;
  holder: string;
}

interface BankTransferPayment {
  type: "bank_transfer";
  accountNumber: string;
  bankCode: string;
}

interface CryptoPayment {
  type: "crypto";
  walletAddress: string;
  network: "Ethereum" | "Bitcoin" | "Solana";
}

type PaymentMethod = CreditCardPayment | BankTransferPayment | CryptoPayment;

function processPayment(payment: PaymentMethod): string {
  // `payment.type` で分岐すると、TS コンパイラが各ブロック内で型を完全絞り込み (Narrowing)
  switch (payment.type) {
    case "credit_card": {
      const masked = `****-****-****-${payment.cardNumber.slice(-4)}`;
      return `CreditCard [Holder: ${payment.holder}, Number: ${masked}]`;
    }
    case "bank_transfer":
      return `BankTransfer [Bank: ${payment.bankCode}, Acc: ${payment.accountNumber}]`;

    case "crypto":
      return `Crypto [Network: ${payment.network}, Address: ${payment.walletAddress}]`;

    default: {
      // 網羅性チェック (Exhaustiveness Check): 新しい支払い方法が追加されたらコンパイルエラーになる
      const _exhaustiveCheck: never = payment;
      throw new Error(`Unhandled payment type: ${_exhaustiveCheck}`);
    }
  }
}

// ============================================================================
// 3. ユーザー定義型ガード (User-Defined Type Guard)
// ============================================================================
interface UserProfile {
  id: string;
  name: string;
  age: number;
}

// `value is UserProfile` という戻り値型アノテーションにより、true の場合に型が確定する
function isUserProfile(value: unknown): value is UserProfile {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value &&
    "age" in value &&
    typeof (value as { age: unknown }).age === "number"
  );
}

// ============================================================================
// 4. ジェネリクスと Utility Types
// ============================================================================
// 不変データ構造 (Rust の struct / C# の record 相当)
type ImmutableUser = Readonly<UserProfile>;

// 全フィールドを更新可能にした Partial
type UserUpdateDto = Partial<UserProfile>;

// Key-Value マッピング (C# Dictionary<string, T> / Java Map<String, T>)
type UserDirectory = Record<string, UserProfile>;

function findFirstMatching<T>(items: T[], predicate: (item: T) => boolean): T | undefined {
  for (const item of items) {
    if (predicate(item)) {
      return item;
    }
  }
  return undefined;
}

// ============================================================================
// 実行関数
// ============================================================================
export function run(): void {
  console.log("--- 1. Structural Subtyping ---");
  const namedPoint: NamedPoint = { x: 3, y: 4, name: "Alpha Point" };
  // NamedPoint は Point2D を明示的に implements していなくても代入可能
  const distance = calculateDistanceFromOrigin(namedPoint);
  console.log(`Point '${namedPoint.name}' Distance from origin: ${distance}`);

  console.log("\n--- 2. Discriminated Unions (Pattern Matching Equivalent) ---");
  const payments: PaymentMethod[] = [
    { type: "credit_card", cardNumber: "1234-5678-9012-3456", holder: "Alice" },
    { type: "crypto", walletAddress: "0x1234abcd5678", network: "Ethereum" },
    { type: "bank_transfer", accountNumber: "987654321", bankCode: "BNK001" },
  ];

  for (const p of payments) {
    console.log(`  ${processPayment(p)}`);
  }

  console.log("\n--- 3. Type Narrowing with unknown and Type Guards ---");
  const rawApiPayload: unknown = { id: "usr-101", name: "Bob", age: 30 };

  if (isUserProfile(rawApiPayload)) {
    // ここでは rawApiPayload は安全に UserProfile 型として扱える
    console.log(`  Valid User: ${rawApiPayload.name} (Age: ${rawApiPayload.age})`);
  } else {
    console.log("  Invalid user payload");
  }

  console.log("\n--- 4. Generics and Utility Types ---");
  const users: UserProfile[] = [
    { id: "u1", name: "Alice", age: 28 },
    { id: "u2", name: "Charlie", age: 35 },
    { id: "u3", name: "Diana", age: 22 },
  ];

  const seniorUser = findFirstMatching(users, (u) => u.age > 30);
  console.log(`  First user over 30: ${seniorUser?.name ?? "None"}`);

  const userDirectory: UserDirectory = {
    [users[0].id]: users[0],
    [users[1].id]: users[1],
  };
  console.log(`  Directory size: ${Object.keys(userDirectory).length} registered users`);
}

// 直接実行された場合
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("01_types_and_generics.ts")) {
  run();
}
