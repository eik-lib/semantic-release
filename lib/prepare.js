import writeEik from "@eik/cli/utils/json/write-eik.js";

const VERSION_WRITTEN = "Version: ✅ v%s written back to eik.json file.";

/**
 * Semantic Release "prepare" hook
 * "Responsible for preparing the release, for example creating or updating files such as package.json, CHANGELOG.md, documentation or compiled assets and pushing a commit."
 * See https://semantic-release.gitbook.io/semantic-release/usage/plugins
 *
 * @param {object} options
 * @param {object} context
 * @param {import('./state.js').State} state
 */
export default async function prepare(options, context, state) {
	if (!state.publishNeeded) return;

	if (state.eikJSON.version !== state.versionToPublish) {
		context.logger.log(VERSION_WRITTEN, state.versionToPublish);
		await writeEik({ version: state.versionToPublish }, { cwd: context.cwd });
	}
}
