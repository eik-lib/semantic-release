import { join } from "path";
import { helpers } from "@eik/common";

/**
 * Semantic Release "generate notes" hook
 * "Responsible for generating the content of the release note. If multiple plugins with a generateNotes step are defined, the release notes will be the result of the concatenation of each plugin output."
 * See https://semantic-release.gitbook.io/semantic-release/usage/plugins
 *
 * @param {object} options
 * @param {object} context
 * @param {import('./state.js').State} state
 */
export default async function generateNotes(options, context, state) {
	if (!state.publishNeeded) return;

	const { name, server, type } = state.eikJSON;
	const version = state.versionToPublish;
	const date = new Date();
	const dateString = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
	const slug = helpers.typeSlug(type);
	const versionURL = new URL(join(slug, name, version), server).href;
	const nameURL = new URL(join(slug, name), server).href;

	return `(${dateString}) Version [${version}](${versionURL}) of Eik package [${name}](${nameURL}) published to [${server}](${server})`;
}
