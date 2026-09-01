/**
 * ============================================================================
 * TypeScript 03: 非同期処理・イベントループ・Promise (Async & Event Loop)
 * ============================================================================
 * 
 * 【他言語経験者（Rust, C#, Go, Java, Python）向け要点】
 * 1. JavaScript の実行モデル (シングルスレッド + Event Loop):
 *    - JS は 1 つのメインスレッド（コールスタック）でコードを実行します。
 *    - I/O やタイマーなどの重い待機処理はブラウザ/Node.jsのランタイムに委譲され、
 *      完了後にコールバックが「タスクキュー」に追加されます。
 * 
 * 2. Microtask (微小タスク) vs Macrotask (マクロタスク):
 *    - Microtask: `Promise.then / await`, `queueMicrotask()` -> 現在の同期処理終了直後に**最優先**で全消化。
 *    - Macrotask: `setTimeout`, `setInterval`, I/O イベント -> 次のイベントループターンで実行。
 * 
 * 3. 並行 Promise 合成の使い分け:
 *    - `Promise.all([p1, p2])`: すべて成功したら完了。1つでも失敗したら即座に全体が例外スロー (All-or-Nothing)。
 *    - `Promise.allSettled([p1, p2])`: 成功・失敗を問わず**全タスクの完了を待機**し、各結果を配列で返す (安全・推奨)。
 *    - `Promise.race([p1, p2])`: 最も早く完了した 1 つの結果/エラーを返す。
 * 
 * 4. 非同期処理のキャンセル: `AbortController` (モダン Web / Node.js 標準):
 *    - タイムアウトやユーザー操作による中断を安全に制御する標準仕様。
 */

// 擬似的な非同期 API 通信
async function fetchUserData(userId: number): Promise<{ id: number; name: string }> {
  await new Promise((resolve) => setTimeout(resolve, 50)); // 50ms 待機
  return { id: userId, name: `User_${userId}` };
}

async function fetchOrderData(userId: number): Promise<string[]> {
  await new Promise((resolve) => setTimeout(resolve, 80)); // 80ms 待機
  return [`Order_A_${userId}`, `Order_B_${userId}`];
}

async function riskyApiCall(fail: boolean): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 30));
  if (fail) {
    throw new Error("Network timeout or 500 Internal Error");
  }
  return "Success Data";
}

export async function run(): Promise<void> {
  console.log("--- 1. Concurrent Async Execution (Promise.all) ---");
  const startTime = performance.now();

  // 2 つの非同期 I/O を同時に並行実行 (C# Task.WhenAll / Go errgroup 相当)
  const [user, orders] = await Promise.all([
    fetchUserData(101),
    fetchOrderData(101),
  ]);

  const elapsed = (performance.now() - startTime).toFixed(2);
  console.log(`Fetched User: ${user.name}`);
  console.log(`Fetched Orders: [ ${orders.join(", ")} ]`);
  console.log(`Completed concurrently in: ${elapsed} ms (Expected ~80ms, not 130ms)`);

  console.log("\n--- 2. Resilient Parallel Execution (Promise.allSettled) ---");
  // 成功するタスクと失敗するタスクを安全に一括実行
  const results = await Promise.allSettled([
    riskyApiCall(false),
    riskyApiCall(true),
    riskyApiCall(false),
  ]);

  results.forEach((res, index) => {
    if (res.status === "fulfilled") {
      console.log(`  Task ${index + 1}: SUCCESS -> "${res.value}"`);
    } else {
      console.log(`  Task ${index + 1}: FAILED  -> "${res.reason.message}"`);
    }
  });

  console.log("\n--- 3. Cancellation with AbortController ---");
  const controller = new AbortController();
  const { signal } = controller;

  // 20ms 後にキャンセルを発火
  setTimeout(() => controller.abort(), 20);

  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => resolve("Completed"), 100);
      signal.addEventListener("abort", () => {
        clearTimeout(timer);
        reject(new Error("Operation aborted by controller"));
      });
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log(`  Caught Abort: ${err.message}`);
    }
  }

  console.log("\n--- 4. Event Loop Microtask vs Macrotask Queue Demo ---");
  console.log("  [1] Synchronous code start");

  setTimeout(() => {
    console.log("  [4] Macrotask (setTimeout) executed");
  }, 0);

  Promise.resolve().then(() => {
    console.log("  [3] Microtask (Promise.then) executed before Macrotask");
  });

  console.log("  [2] Synchronous code end");

  // タイマーの完了を待ってログを確実に表示
  await new Promise((resolve) => setTimeout(resolve, 50));
}

// 直接実行された場合
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("03_async_and_eventloop.ts")) {
  run();
}
