/**
 * ============================================================================
 * TypeScript 02: 制御構文・配列パイプライン・不変操作 (Control & Immutability)
 * ============================================================================
 * 
 * 【他言語経験者（Rust, C#, Go, Java, Python）向け要点】
 * 1. 配列メソッドチェーン (LINQ / Stream / Rust Iterator / Python 内包表記相当):
 *    - `.map()`, `.filter()`, `.reduce()`, `.find()`, `.some()`, `.every()`
 *    - 元の配列を変更（破壊）せず、新しい配列を返すイミュータブル操作が鉄則。
 * 
 * 2. オプショナルチェイニング (`?.`) と Null合体演算子 (`??`):
 *    - `user?.address?.city`: 途中で `null` または `undefined` があれば即座に `undefined` を返す。
 *    - `value ?? defaultValue`: `value` が `null` または `undefined` のときのみ右辺を採用。
 *    - 【罠】`value || defaultValue` を使うと、`0` や `""` (空文字)、`false` まで falsy と判定されて上書きされる。
 * 
 * 3. `===` (厳格等価) vs `==` (緩い等価 - 使用禁止):
 *    - `==` は暗黙の型変換を行うため、`0 == ""` や `false == 0` が `true` になる深刻なバグの温床。
 *    - JS/TS では常に `===` および `!==` を使用するのが業界標準。
 * 
 * 4. スプレッド構文 (`...`) と `structuredClone()`:
 *    - `{ ...obj, newProp: 10 }`: 浅いコピー (Shallow Copy) で不変更新。
 *    - `structuredClone(obj)`: ネストしたオブジェクトや配列の完全なディープコピー (ES2022+ 標準)。
 */

interface ProductItem {
  id: string;
  name: string;
  category: "Electronics" | "Books" | "Apparel";
  price: number;
  stock: number;
}

interface OrderInfo {
  orderId: string;
  customer?: {
    name: string;
    shippingAddress?: {
      city: string;
      postalCode?: string;
    };
  };
}

export function run(): void {
  console.log("--- 1. Array Processing Pipeline (LINQ / Stream Equivalent) ---");
  const products: ProductItem[] = [
    { id: "p1", name: "MacBook Pro", category: "Electronics", price: 250000, stock: 5 },
    { id: "p2", name: "Mechanical Keyboard", category: "Electronics", price: 18000, stock: 0 },
    { id: "p3", name: "Rust in Action", category: "Books", price: 4200, stock: 8 },
    { id: "p4", name: "Clean Code", category: "Books", price: 3800, stock: 12 },
  ];

  // 在庫あり書籍のタイトルを大文字にして抽出 (C# .Where().Select())
  const availableBookNames = products
    .filter((p) => p.category === "Books" && p.stock > 0)
    .map((p) => p.name.toUpperCase());
  console.log(`Available Books: [ ${availableBookNames.join(", ")} ]`);

  // 在庫あり商品の合計金額 (C# .Aggregate() / Java Stream.reduce())
  const totalInventoryValue = products.reduce((acc, p) => acc + p.price * p.stock, 0);
  console.log(`Total Inventory Value: JPY ${totalInventoryValue.toLocaleString()}`);

  console.log("\n--- 2. Optional Chaining (?.) and Nullish Coalescing (??) ---");
  const orderWithAddress: OrderInfo = {
    orderId: "ord-001",
    customer: {
      name: "Alice",
      shippingAddress: { city: "Tokyo" },
    },
  };

  const orderWithoutAddress: OrderInfo = {
    orderId: "ord-002",
  };

  // オプショナルチェイニングで安全にネストアクセス
  const city1 = orderWithAddress.customer?.shippingAddress?.city ?? "Unknown City";
  const city2 = orderWithoutAddress.customer?.shippingAddress?.city ?? "Unknown City";
  console.log(`Order 1 City: ${city1}`);
  console.log(`Order 2 City: ${city2}`);

  // ?? vs || の違い (数値 0 や空文字の扱い)
  const count = 0;
  const resultUsingOr = count || 10;   // ❌ 0 を falsy と判定して 10 になってしまう
  const resultUsingNullish = count ?? 10; // ⭕ 0 を正常な値として保持
  console.log(`count || 10: ${resultUsingOr} (Incorrect if 0 is valid)`);
  console.log(`count ?? 10: ${resultUsingNullish} (Correct nullish coalescing)`);

  console.log("\n--- 3. Strict Equality (===) vs Loose Equality (==) ---");
  // @ts-expect-error - 型が異なる比較のデモ
  console.log(`0 === "0" (Strict): ${0 === "0"}`); // false
  console.log(`null === undefined: ${null === undefined}`); // false
  console.log(`null == undefined (Loose): ${null == undefined}`); // true

  console.log("\n--- 4. Immutable Updates (Spread) & Deep Clone ---");
  const originalUser = {
    id: "usr-1",
    profile: { theme: "dark", notifications: true },
    tags: ["typescript", "rust"],
  };

  // スプレッド構文による不変更新 (Shallow Copy)
  const updatedUser = {
    ...originalUser,
    id: "usr-2", // プロパティ上書き
  };
  console.log(`Updated User ID: ${updatedUser.id} (Original ID: ${originalUser.id})`);

  // structuredClone による安全なディープコピー
  const deepClonedUser = structuredClone(originalUser);
  deepClonedUser.profile.theme = "light";
  console.log(`Original Theme: ${originalUser.profile.theme}`);
  console.log(`Cloned Theme:   ${deepClonedUser.profile.theme}`);
}

// 直接実行された場合
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("02_control_and_immutability.ts")) {
  run();
}
