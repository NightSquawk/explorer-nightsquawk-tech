// @ts-ignore
import { cloudflareTest } from "@cloudflare/vitest-pool-workers";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Resolved as an absolute path because, unlike the old `poolOptions.workers`
// API, the plugin-based config resolves relative `wrangler.configPath` values
// against the process cwd rather than this config file's directory.
const wranglerConfigPath = fileURLToPath(
	new URL("../dev/wrangler.toml", import.meta.url),
);

// NOTE: @cloudflare/vitest-pool-workers@0.22.0 replaced the vitest 3.x
// `defineWorkersConfig({ test: { poolOptions: { workers } } })` API (imported
// from the "/config" subpath, which no longer exists) with a vitest 4.x plugin:
// `defineConfig({ plugins: [cloudflareTest(workersOptions)] })`. This mirrors
// the package's own `codemods/vitest-v3-to-v4` transform.
export default defineConfig({
	esbuild: {
		target: "ES2022",
	},
	plugins: [
		cloudflareTest({
			singleWorker: true,
			wrangler: { configPath: wranglerConfigPath },
			miniflare: {
				compatibilityDate: "2024-11-06", // Or your project's compatibility date
				compatibilityFlags: ["nodejs_compat"], // Add any necessary flags
				r2Persist: false,
				isolatedStorage: true,
				r2Buckets: {
					MY_TEST_BUCKET_1: "MY_TEST_BUCKET_1",
					MY_TEST_BUCKET_2: "MY_TEST_BUCKET_2",
					teste: "teste",
				},
				bindings: {
					NON_R2_BINDING: { type: "var", value: "some_value" }, // For testing non-bucket bindings
					// Add other global bindings if needed by the worker, e.g., KV or D1
					// EMAIL_SENDER: { type: "send_email", ... } // if using abstract senders for emails
				},
			},
		}),
	],
	test: {
		coverage: {
			enabled: false,
			provider: "istanbul",
			include: ["src/**"],
		},
	},
});
