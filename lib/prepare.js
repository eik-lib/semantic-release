const json = require('@eik/cli/utils/json');

const VERSION_WRITTEN = 'Version: ✅ v%s written back to eik.json file.';

/**
 * Semantic Release "prepare" hook
 * "Responsible for preparing the release, for example creating or updating files such as package.json, CHANGELOG.md, documentation or compiled assets and pushing a commit."
 * See https://github.com/semantic-release/semantic-release/blob/master/docs/usage/plugins.md#plugins
 *
 * @param {object} options
 * @param {object} context
 * @param {object} state
 */
module.exports = async function prepare(options, context, state) {
    if (!state.publishNeeded) return;

    if (state.eikJSON.version !== state.versionToPublish) {
        context.logger.log(VERSION_WRITTEN, state.versionToPublish);
        await json.writeEik(
            { version: state.versionToPublish },
            { cwd: context.cwd },
        );
    }
};
