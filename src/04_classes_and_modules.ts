/**
 * ============================================================================
 * TypeScript 04: クラス・thisの罠・プライベートフィールド (Classes & this)
 * ============================================================================
 * 
 * 【他言語経験者（Rust, C#, Go, Java, Python）向け要点】
 * 1. this バインディングの罠 (他言語と最も異なる点):
 *    - JS の通常の `function` / メソッドにおける `this` は「定義時」ではなく
 *      **「呼び出し元 (Call Site)」** によって動的に決定されます。
 *    - メソッドをコールバック（`setTimeout(obj.method, 100)`）として渡すと `this` が見失われ `undefined` になります。
 *    - 【解決策】:
 *      ① アロー関数 `() => {}` を使う (外側のスコープの `this` をレキシカルにキャプチャ)。
 *      ② `.bind(this)` を使う。
 * 
 * 2. 真のプライベートフィールド (`#privateField` - ES2022+):
 *    - TypeScript の `private` キーワードは**コンパイル時のみの制限**で、実行時JSでは通常のプロパティとしてアクセス可能です。
 *    - ハッシュ記号で始まる `#field` は **JS エンジンレベルで真にカプセル化** され、外部から絶対にアクセスできません。
 * 
 * 3. ES Modules (ESM) vs CommonJS (CJS):
 *    - モダン環境（Node.js 20+, Web）では `import` / `export` の ESM が標準です。
 */

interface Printable {
  toString(): string;
}

// 銀行口座クラス
class BankAccount implements Printable {
  readonly accountNumber: string; // 読み取り専用プロパティ
  #balance: number;               // 真のプライベートフィールド (ES2022+ 標準)

  constructor(accountNumber: string, initialBalance: number) {
    this.accountNumber = accountNumber;
    this.#balance = Math.max(0, initialBalance);
  }

  // Getter
  get balance(): number {
    return this.#balance;
  }

  // 入金メソッド
  deposit(amount: number): void {
    if (amount <= 0) {
      throw new Error("Deposit amount must be positive");
    }
    this.#balance += amount;
  }

  // 出金メソッド
  withdraw(amount: number): boolean {
    if (amount > 0 && this.#balance >= amount) {
      this.#balance -= amount;
      return true;
    }
    return false;
  }

  // 通常のメソッド (this が動的に決定される)
  getStatement(): string {
    return `[Acc: ${this.accountNumber}] Balance: JPY ${this.#balance.toLocaleString()}`;
  }

  // アロー関数プロパティ (this がインスタンスに恒久的に束縛される)
  getStatementSafe = (): string => {
    return `[Acc: ${this.accountNumber}] Balance: JPY ${this.#balance.toLocaleString()}`;
  };

  toString(): string {
    return this.getStatement();
  }
}

export function run(): void {
  console.log("--- 1. Modern Classes & True Private Fields (#) ---");
  const account = new BankAccount("JP-998877", 100000);
  account.deposit(50000);
  const success = account.withdraw(30000);
  console.log(`Withdrawal of 30,000 JPY: ${success ? "SUCCESS" : "FAILED"}`);
  console.log(`Current Balance: JPY ${account.balance.toLocaleString()}`);
  console.log(`Statement: ${account.getStatement()}`);

  console.log("\n--- 2. The 'this' Binding Trap & Arrow Function Solution ---");
  // コールバックや高階関数に関数を渡す場面のシミュレーション
  const normalMethod = account.getStatement;
  try {
    // ❌ 通常のメソッド参照をそのまま呼び出すと this が undefined になり TypeError
    normalMethod();
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log(`  Normal method invocation without context threw: ${err.name}`);
    }
  }

  // ⭕ アロー関数プロパティなら、関数参照を単体で渡しても this が壊れない
  const safeMethod = account.getStatementSafe;
  console.log(`  Arrow property invocation (safe): ${safeMethod()}`);

  console.log("\n--- 3. Static Methods & Factory Pattern ---");
  class IdGenerator {
    static #counter = 0;
    static generate(prefix: string): string {
      this.#counter += 1;
      return `${prefix}-${String(this.#counter).padStart(4, "0")}`;
    }
  }

  console.log(`Generated ID 1: ${IdGenerator.generate("USER")}`);
  console.log(`Generated ID 2: ${IdGenerator.generate("USER")}`);
  console.log(`Generated ID 3: ${IdGenerator.generate("ORDER")}`);
}

// 直接実行された場合
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("04_classes_and_modules.ts")) {
  run();
}
