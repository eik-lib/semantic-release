const { join } = require('path');
const { default: fetch } = require('node-fetch');
const { typeSlug } = require('@eik/common-utils');

const PUBLISH_SUCCESS =
    'Publish: ✅ Successfully published package %s (v%s) to %s.';
const PUBLISH_FAILURE =
    'Publish: ❌ Unable to locate package %s (v%s) at %s. Received HTTP status code %s.';

/**
 * Semantic Release "success" hook
 * "Responsible for notifying of a new release."
 * See https://github.com/semantic-release/semantic-release/blob/master/docs/usage/plugins.md#plugins
 *
 * @param {object} options
 * @param {object} context
 * @param {object} state
 */
module.exports = async function success(options, context, state) {
    if (!state.publishNeeded) return;
    const { logger } = context;
    const { server, name, type } = state.eikJSON;
    const slug = typeSlug(type);
    const url = new URL(join(slug, name, state.versionToPublish), server);
    url.searchParams.set('ts', `${Date.now()}`);
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
};
