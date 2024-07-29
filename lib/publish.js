import eik from '@eik/cli';

const PUBLISHED = 'Publish: ✅ Published %s file(s) to Eik server %s';
const E_PUBLISH_FAILED =
    'Publish: ❌ Failed, this may leave your build in a broken state. If retrying the build fails, try pushing a new commit.';

/**
 * Semantic Release "publish" hook
 * "Responsible for publishing the release."
 * See https://semantic-release.gitbook.io/semantic-release/usage/plugins
 *
 * @param {object} options
 * @param {object} context
 * @param {object} state
 */
export default async function publish(options, context, state) {
    if (!state.publishNeeded) return;

    try {
        const result = await eik.publish({
            name: state.eikJSON.name,
            type: state.eikJSON.type,
            server: state.eikJSON.server,
            files: state.eikJSON.files,
            cwd: context.cwd,
            token: state.eikToken,
            dryRun: false,
            version: state.versionToPublish,
            map: state.eikJSON.map,
            out: state.eikJSON.out,
        });
        const filesPublished = result.files.filter(
            (file) => file.type === 'pkg',
        );
        context.logger.log(
            PUBLISHED,
            filesPublished.length,
            state.eikJSON.server,
        );
    } catch (err) {
        context.logger.log(E_PUBLISH_FAILED);
        throw err;
    }
}
