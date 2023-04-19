const { join } = require("path");
const { typeSlug } = require("@eik/common-utils");

/**
 * Semantic Release "generate notes" hook
 * "Responsible for generating the content of the release note. If multiple plugins with a generateNotes step are defined, the release notes will be the result of the concatenation of each plugin output."
 * See https://github.com/semantic-release/semantic-release/blob/master/docs/usage/plugins.md#plugins
 *
 * @param {object} options
 * @param {object} context
 * @param {object} state
 */
module.exports = async function generateNotes(options, context, state) {
  if (!state.publishNeeded) return;

  const { name, server, type } = state.eikJSON;
  const version = state.versionToPublish;
  const date = new Date();
  const dateString = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  const slug = typeSlug(type);
  const versionURL = new URL(join(slug, name, version), server).href;
  const nameURL = new URL(join(slug, name), server).href;

  return `(${dateString}) Version [${version}](${versionURL}) of Eik package [${name}](${nameURL}) published to [${server}](${server})`;
};
