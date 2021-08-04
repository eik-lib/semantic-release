const eik = require("@eik/cli");

const messages = {
  PUBLISHED: (length, server) =>
    `Published ${length} file(s) to Eik server ${server}`,
  EPUBLISHFAILED:
    "Publish to Eik server failed. This may leave your build in a broken state. If retrying the build fails, try pushing a new commit.",
};

/**
 * Semantic Release "publish" hook
 * "Responsible for publishing the release."
 * See https://github.com/semantic-release/semantic-release/blob/master/docs/usage/plugins.md#plugins
 *
 * @param {object} options
 * @param {object} context
 * @param {object} state
 */
module.exports = async function publish(options, context, state) {
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
    const filesPublished = result.files.filter((file) => file.type === "pkg");
    context.logger.log(
      messages.PUBLISHED(filesPublished.length, state.eikJSON.server)
    );
  } catch (err) {
    context.logger.log(messages.EPUBLISHFAILED);
    throw err;
  }
};
