const eik = require("@eik/cli");

const messages = {
  ENOFILES: `No files detected for upload. Did you run bundling first (if needed)? Is the "files" field of eik.json correct?`,
  EVERIFYFAIL: "Verification checks failed to complete",
  FOUNDFILES: "Found %d file(s) to publish",
};

/**
 * Semantic Release "verify release" hook
 * "Responsible for verifying the parameters (version, type, dist-tag etc...) of the release that is about to be published."
 * See https://github.com/semantic-release/semantic-release/blob/master/docs/usage/plugins.md#plugins
 *
 * @param {object} options
 * @param {object} context
 * @param {object} state
 */
module.exports = async function verifyRelease(options, context, state) {
  if (!state.publishNeeded) return;

  try {
    const result = await eik.publish({
      name: state.eikJSON.name,
      type: state.eikJSON.type,
      server: state.eikJSON.server,
      files: state.eikJSON.files,
      cwd: context.cwd,
      token: state.eikToken,
      dryRun: true,
      version: state.versionToPublish,
      map: state.eikJSON.map,
      out: state.eikJSON.out,
    });

    const filesToBePublished = result.files.filter(
      (file) => file.type === "package file"
    );
    if (!filesToBePublished.length) throw new Error(messages.ENOFILES);

    context.logger.log(messages.FOUNDFILES, filesToBePublished.length);
  } catch (err) {
    context.logger.log(messages.EVERIFYFAIL);
    throw err;
  }
};
