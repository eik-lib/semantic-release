const messages = {
  CHANGELOG(server, name, version) {
    const date = new Date();
    const dateString = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const vURL = new URL(`/pkg/${name}/${version}`, server).href;
    const nURL = new URL(`/pkg/${name}`, server).href;

    return `(${dateString}) Version [${version}](${vURL}) of Eik package [${name}](${nURL}) published to [${server}](${server})`;
  },
};

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

  const { name, server } = state.eikJSON;
  return messages.CHANGELOG(server, name, state.versionToPublish);
};
