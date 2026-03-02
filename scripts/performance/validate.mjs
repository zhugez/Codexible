#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const rootDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");
const defaultThresholdsPath = path.join(rootDir, "scripts", "performance", "thresholds.json");
const defaultBaselinePath = path.join(rootDir, "scripts", "performance", "baseline.json");

function parseArgs(argv) {
  const parsed = {
    ci: false,
    output: "",
    thresholds: defaultThresholdsPath,
    baseline: defaultBaselinePath,
    iterations: null,
    timeoutMs: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--ci") {
      parsed.ci = true;
    } else if (arg === "--output" && argv[i + 1]) {
      parsed.output = argv[i + 1];
      i += 1;
    } else if (arg === "--thresholds" && argv[i + 1]) {
      parsed.thresholds = argv[i + 1];
      i += 1;
    } else if (arg === "--baseline" && argv[i + 1]) {
      parsed.baseline = argv[i + 1];
      i += 1;
    } else if (arg === "--iterations" && argv[i + 1]) {
      parsed.iterations = Number(argv[i + 1]);
      i += 1;
    } else if (arg === "--timeout-ms" && argv[i + 1]) {
      parsed.timeoutMs = Number(argv[i + 1]);
      i += 1;
    }
  }

  return parsed;
}

function percentile(values, p) {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return Number(sorted[idx].toFixed(2));
}

function mean(values) {
  if (values.length === 0) {
    return 0;
  }
  const total = values.reduce((sum, value) => sum + value, 0);
  return Number((total / values.length).toFixed(2));
}

function nowMs() {
  return Number(process.hrtime.bigint()) / 1_000_000;
}

async function timedRequest(url, init, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const start = nowMs();
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    return {
      ok: response.ok,
      status: response.status,
      durationMs: Number((nowMs() - start).toFixed(2)),
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : "request_failed",
      durationMs: Number((nowMs() - start).toFixed(2)),
    };
  } finally {
    clearTimeout(timeout);
  }
}

function buildInit(pathConfig, token) {
  const headers = {};
  if (pathConfig.requiresAuth) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (pathConfig.body) {
    headers["Content-Type"] = "application/json";
  }

  return {
    method: pathConfig.method,
    headers,
    body: pathConfig.body ? JSON.stringify(pathConfig.body) : undefined,
  };
}

function deltaFromBaseline(result, baselineMap) {
  const baseline = baselineMap.get(result.id);
  if (!baseline) {
    return null;
  }
  return {
    p95LatencyDeltaMs: Number((result.latency.p95Ms - baseline.p95LatencyMs).toFixed(2)),
    throughputDeltaRps: Number((result.throughput.rps - baseline.throughputRps).toFixed(2)),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const mode = args.ci ? "ci" : "local";
  const baseUrl = process.env.PERF_API_URL || "http://127.0.0.1:3001";
  const token = process.env.PERF_TOKEN || "codexible_demo_business_2026";
  const iterations =
    args.iterations ?? Number(process.env.PERF_ITERATIONS || (args.ci ? 10 : 20));
  const timeoutMs =
    args.timeoutMs ?? Number(process.env.PERF_TIMEOUT_MS || (args.ci ? 4000 : 2500));

  const thresholdsRaw = await readFile(args.thresholds, "utf-8");
  const thresholds = JSON.parse(thresholdsRaw);
  const baselineRaw = await readFile(args.baseline, "utf-8");
  const baseline = JSON.parse(baselineRaw);
  const baselineMap = new Map(
    (baseline.results || []).map((entry) => [entry.id, entry]),
  );

  const results = [];
  for (const pathConfig of thresholds.criticalPaths) {
    const pathIterations = Number(pathConfig.iterations || iterations);
    const init = buildInit(pathConfig, token);
    const durations = [];
    const failures = [];
    const batchStart = nowMs();

    for (let i = 0; i < pathIterations; i += 1) {
      const response = await timedRequest(`${baseUrl}${pathConfig.path}`, init, timeoutMs);
      durations.push(response.durationMs);
      if (!response.ok) {
        failures.push({
          iteration: i + 1,
          status: response.status,
          error: response.error || null,
        });
      }
    }

    const elapsedSeconds = Math.max((nowMs() - batchStart) / 1000, 0.001);
    const successCount = pathIterations - failures.length;
    const throughputRps = Number((successCount / elapsedSeconds).toFixed(2));
    const p95Ms = percentile(durations, 95);
    const avgMs = mean(durations);
    const maxMs = Number(Math.max(...durations).toFixed(2));
    const latencyBudgetMs = pathConfig.latencyBudgetMs[mode];
    const throughputBudgetRps = pathConfig.throughputBudgetRps[mode];

    const violations = [];
    if (failures.length > 0) {
      violations.push(`request_errors:${failures.length}`);
    }
    if (p95Ms > latencyBudgetMs) {
      violations.push(`p95_latency>${latencyBudgetMs}ms`);
    }
    if (throughputRps < throughputBudgetRps) {
      violations.push(`throughput<${throughputBudgetRps}rps`);
    }

    const result = {
      id: pathConfig.id,
      label: pathConfig.label,
      endpoint: `${pathConfig.method} ${pathConfig.path}`,
      sampleSize: pathIterations,
      successCount,
      failureCount: failures.length,
      latency: {
        averageMs: avgMs,
        p95Ms,
        maxMs,
        budgetMs: latencyBudgetMs,
      },
      throughput: {
        rps: throughputRps,
        budgetRps: throughputBudgetRps,
      },
      baselineDelta: null,
      failures,
      violations,
      passed: violations.length === 0,
    };

    result.baselineDelta = deltaFromBaseline(result, baselineMap);
    results.push(result);
  }

  const violatingPaths = results
    .filter((result) => !result.passed)
    .map((result) => ({
      id: result.id,
      label: result.label,
      violations: result.violations,
    }));
  const allPassed = violatingPaths.length === 0;

  const report = {
    mode,
    baseUrl,
    tokenSource: process.env.PERF_TOKEN ? "env" : "default_demo_token",
    timestamp: new Date().toISOString(),
    thresholdsFile: path.resolve(args.thresholds),
    baselineFile: path.resolve(args.baseline),
    iterations,
    timeoutMs,
    passed: allPassed,
    violatingPaths,
    results,
  };

  console.log(`Performance validation mode: ${mode}`);
  console.log(`Target API: ${baseUrl}`);
  console.log(`Iterations per path: ${iterations}`);
  for (const result of results) {
    const status = result.passed ? "PASS" : "FAIL";
    const delta =
      result.baselineDelta == null
        ? "delta n/a"
        : `delta p95 ${result.baselineDelta.p95LatencyDeltaMs >= 0 ? "+" : ""}${result.baselineDelta.p95LatencyDeltaMs}ms, throughput ${result.baselineDelta.throughputDeltaRps >= 0 ? "+" : ""}${result.baselineDelta.throughputDeltaRps}rps`;
    console.log(
      `[${status}] ${result.label} | p95 ${result.latency.p95Ms}ms (budget ${result.latency.budgetMs}ms) | throughput ${result.throughput.rps}rps (budget ${result.throughput.budgetRps}rps) | ${delta}`,
    );
    if (!result.passed) {
      console.log(`  Violations: ${result.violations.join(", ")}`);
    }
  }

  console.log("Machine-readable report:");
  console.log(JSON.stringify(report, null, 2));

  if (args.output) {
    const outputPath = path.resolve(args.output);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf-8");
    console.log(`Wrote report to ${outputPath}`);
  }

  if (args.ci && !allPassed) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Performance validation failed:", error);
  process.exit(1);
});
