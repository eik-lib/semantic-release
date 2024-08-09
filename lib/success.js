import { join } from "node:path";
import { helpers } from "@eik/common";

const PUBLISH_SUCCESS =
	"Publish: ✅ Successfully published package %s (v%s) to %s.";
const PUBLISH_FAILURE =
	"Publish: ❌ Unable to locate package %s (v%s) at %s. Received HTTP status code %s.";

/**
 * Semantic Release "success" hook
 * "Responsible for notifying of a new release."
 * See https://semantic-release.gitbook.io/semantic-release/usage/plugins
 *
 * @param {object} options
 * @param {object} context
 * @param {import('./state.js').State} state
 */
export default async function success(options, context, state) {
	if (!state.publishNeeded) return;
	const { logger } = context;
	const { server, name, type } = state.eikJSON;
	const slug = helpers.typeSlug(type);
	const url = new URL(join(slug, name, state.versionToPublish), server);
	url.searchParams.set("ts", `${Date.now()}`);
	const result = await fetch(url);
	if (result.ok) {
		logger.log(PUBLISH_SUCCESS, name, state.versionToPublish, url.href);
	} else {
		logger.log(
			PUBLISH_FAILURE,
			name,
			state.versionToPublish,
			url.href,
			result.status,
		);
	}
}
