const { join } = require("path");
const fetch = require("node-fetch");
const common = require("@eik/common");

const messages = {
  PUBLISHSUCCESS: "Publish: ✅ Successfully published package %s (v%s) to %s.",
  PUBLISHFAILURE:
    "Publish: ❌ Unable to locate package %s (v%s) at %s. It appears something went wrong during publish.",
};

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
  const slug = common.helpers.typeSlug(type);
  const url = new URL(join(slug, name, state.versionToPublish), server);
  url.searchParams.set("ts", Date.now());
  const result = await fetch(url);
  if (result.ok) {
    logger.log(messages.PUBLISHSUCCESS, name, state.versionToPublish, url.href);
  } else {
    logger.log(messages.PUBLISHFAILURE, name, state.versionToPublish, url.href);
  }
};
