import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const rootDir = resolve(import.meta.dir, "..");

const componentPackages = [
  {
    name: "qanary-component-eat-simple",
    port: 40500,
    envFile: resolve(rootDir, "apps/qanary-component-eat-simple/.env"),
  },
  {
    name: "qanary-component-nerd-simple",
    port: 40501,
    envFile: resolve(rootDir, "apps/qanary-component-nerd-simple/.env"),
  },
  {
    name: "qanary-component-dis",
    port: 40502,
    envFile: resolve(rootDir, "apps/qanary-component-dis/.env"),
  },
  {
    name: "qanary-component-relation-detection",
    port: 40503,
    envFile: resolve(rootDir, "apps/qanary-component-relation-detection/.env"),
  },
  {
    name: "qanary-component-sparql-generation",
    port: 40504,
    envFile: resolve(rootDir, "apps/qanary-component-sparql-generation/.env"),
  },
];

const readinessTimeoutMs = 120000;

const log = (message) => {
  console.info(`[benchmark:demo] ${message}`);
};

const fail = (message) => {
  console.error(`[benchmark:demo] ${message}`);
  process.exitCode = 1;
};

const stripAnsi = (value) => {
  return value
    .replace(/\u001B\[[0-9;]*[A-Za-z]/g, "")
    .replace(/\u0004/g, "")
    .trimEnd();
};

const ensureComponentEnvFilesExist = () => {
  const missingEnvFiles = componentPackages.filter((component) => {
    return !existsSync(component.envFile);
  });

  if (missingEnvFiles.length === 0) {
    return;
  }

  const listedFiles = missingEnvFiles.map((component) => component.envFile).join("\n");
  throw new Error(
    [
      "Missing component environment files.",
      "Create them from the checked-in .env.example files before running the benchmark:",
      listedFiles,
    ].join("\n")
  );
};

const spawnManaged = (command, args, options = {}) => {
  const child = spawn(command, args, {
    cwd: rootDir,
    stdio: ["inherit", "pipe", "pipe"],
    env: process.env,
    ...options,
  });

  if (!child.pid) {
    throw new Error(`Failed to start process: ${command} ${args.join(" ")}`);
  }

  return child;
};

const stopChildProcess = async (child) => {
  if (!child.pid || child.killed) {
    return;
  }

  child.kill("SIGTERM");

  await Promise.race([
    new Promise((resolveStop) => {
      child.once("exit", () => resolveStop());
    }),
    delay(5000).then(() => {
      child.kill("SIGKILL");
    }),
  ]);
};

const createReadinessTracker = () => {
  const states = new Map(
    componentPackages.map((component) => [
      component.name,
      {
        started: false,
        registered: false,
        lastRegistrationFailure: undefined,
      },
    ])
  );

  const updateFromLine = (rawLine) => {
    const line = stripAnsi(rawLine);
    if (!line) {
      return;
    }

    let matchedComponent = null;

    for (const component of componentPackages) {
      if (line.includes(component.name)) {
        matchedComponent = component.name;
        break;
      }
    }

    if (!matchedComponent) {
      return;
    }

    const state = states.get(matchedComponent);
    if (!state) {
      return;
    }

    if (line.includes("Started Qanary component at")) {
      state.started = true;
      log(`${matchedComponent} started.`);
    }

    if (line.includes(`Component ${matchedComponent} was registered`)) {
      state.registered = true;
      state.lastRegistrationFailure = undefined;
      log(`${matchedComponent} registered in the Qanary pipeline.`);
    }

    if (line.includes(`Component ${matchedComponent} could not be registered`)) {
      state.lastRegistrationFailure = line;
    }
  };

  const waitForRegistration = async () => {
    const startedAt = Date.now();

    while (Date.now() - startedAt < readinessTimeoutMs) {
      const pending = [...states.entries()].filter(([, state]) => {
        return !state.started || !state.registered;
      });

      if (pending.length === 0) {
        return;
      }

      await delay(500);
    }

    const pendingStates = [...states.entries()]
      .filter(([, state]) => !state.started || !state.registered)
      .map(([name, state]) => {
        const parts = [];
        if (!state.started) {
          parts.push("not started");
        }
        if (!state.registered) {
          parts.push("not registered");
        }
        if (state.lastRegistrationFailure) {
          parts.push(`last registration failure: ${state.lastRegistrationFailure}`);
        }
        return `${name} (${parts.join(", ")})`;
      })
      .join("\n");

    throw new Error(`Timed out waiting for Qanary components to start and register:\n${pendingStates}`);
  };

  return {
    updateFromLine,
    waitForRegistration,
  };
};

const pipeProcessOutput = (child, readinessTracker) => {
  const attach = (stream, target) => {
    if (!stream) {
      return;
    }

    let buffer = "";

    stream.on("data", (chunk) => {
      const text = chunk.toString();
      target.write(text);
      buffer += text;

      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        readinessTracker.updateFromLine(line);
      }
    });

    stream.on("end", () => {
      if (buffer.length > 0) {
        readinessTracker.updateFromLine(buffer);
      }
    });
  };

  attach(child.stdout, process.stdout);
  attach(child.stderr, process.stderr);
};

const run = async () => {
  ensureComponentEnvFilesExist();
  const readinessTracker = createReadinessTracker();

  log("Starting required Qanary components through Turbo.");
  const componentProcess = spawnManaged("bun", [
    "run",
    "dev",
    "--",
    "--ui",
    "stream",
    ...componentPackages.map((component) => `--filter=${component.name}`),
  ]);
  pipeProcessOutput(componentProcess, readinessTracker);

  const cleanup = async () => {
    await stopChildProcess(componentProcess);
  };

  process.on("SIGINT", async () => {
    await cleanup();
    process.exit(130);
  });

  process.on("SIGTERM", async () => {
    await cleanup();
    process.exit(143);
  });

  try {
    log("Waiting for components to start and register in the Qanary pipeline.");
    await readinessTracker.waitForRegistration();

    log("Running chatbot benchmark.");
    const benchmarkExitCode = await new Promise((resolveCode, reject) => {
      const benchmarkProcess = spawn("bun", ["run", "--filter", "@leipzigtreechat/chatbot", "benchmark:demo"], {
        cwd: rootDir,
        stdio: "inherit",
        env: process.env,
      });

      benchmarkProcess.once("error", reject);
      benchmarkProcess.once("exit", (code) => resolveCode(code ?? 1));
    });

    if (benchmarkExitCode !== 0) {
      throw new Error(`Benchmark exited with code ${benchmarkExitCode}`);
    }
  } finally {
    log("Stopping local Qanary components.");
    await cleanup();
  }
};

void run().catch((error) => {
  fail(error instanceof Error ? error.message : "Unknown benchmark runner failure.");
});
