import { WorkerEntrypoint } from "cloudflare:workers";
import { R2Explorer } from "../src";

const baseConfig = {
	readonly: false,
	cors: true,
	showHiddenFiles: true,
};

// A plain `export default { fetch, email }` object works fine for `wrangler
// dev`/deploy, but @cloudflare/vitest-pool-workers>=0.16 requires the `main`
// module's default export to be a `WorkerEntrypoint` subclass, since the
// `SELF` binding it injects into `cloudflare:test` (and, transitively, `env`)
// is only usable for RPC against a real entrypoint class.
export default class extends WorkerEntrypoint {
	async email(event) {
		await R2Explorer(baseConfig).email(event, this.env, this.ctx);
	}

	async fetch(request) {
		return R2Explorer({
			...baseConfig,
			basicAuth: {
				username: this.env.BASIC_USERNAME,
				password: this.env.BASIC_PASSWORD,
			},
		}).fetch(request, this.env, this.ctx);
	}
}
