/**
 * ============================================================================
 * Modern TypeScript / JavaScript Crash Course - Main Runner
 * For Rust / C# / Go / Java / Python Developers
 * ============================================================================
 */

import { run as run01 } from "./01_types_and_generics.js";
import { run as run02 } from "./02_control_and_immutability.js";
import { run as run03 } from "./03_async_and_eventloop.js";
import { run as run04 } from "./04_classes_and_modules.js";

function printBanner(title: string): void {
  console.log("\n" + "=".repeat(64));
  console.log(`  ${title}`);
  console.log("=".repeat(64) + "\n");
}

function printSection(title: string): void {
  console.log("\n" + "#".repeat(64));
  console.log(`# ${title}`);
  console.log("#".repeat(64) + "\n");
}

async function main(): Promise<void> {
  printBanner(`MODERN JS/TS CRASH COURSE (Running on Node.js ${process.version})`);

  printSection("01: Type System, Structural Typing, and Generics");
  run01();

  printSection("02: Control Flow, Array Pipelines, and Immutability");
  run02();

  printSection("03: Async, Event Loop, Promises, and AbortController");
  await run03();

  printSection("04: Classes, True Private Fields (#), and this Binding");
  run04();

  printBanner("ALL JS/TS TUTORIAL MODULES COMPLETED SUCCESSFULLY!");
}

// エントリーポイント実行
main().catch((err: unknown) => {
  console.error("Unhandled error in main:", err);
  process.exit(1);
});
