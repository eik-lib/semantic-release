const eik = require("@eik/cli");

const E_NO_FILES = `Verify: ❌ No files detected for upload. Did you run bundling first (if needed)? Is the "files" field of eik.json correct?`;
const E_VERIFY_FAIL = "Verify: ❌ Verification checks failed to complete";
const FOUND_FILES = "Verify: ✅ Found %d file(s) to publish";

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
    if (!filesToBePublished.length) throw new Error(E_NO_FILES);

    context.logger.log(FOUND_FILES, filesToBePublished.length);
  } catch (err) {
    context.logger.log(E_VERIFY_FAIL);
    throw err;
  }
};
