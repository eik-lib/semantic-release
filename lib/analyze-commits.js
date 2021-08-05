const eik = require("@eik/cli");

const I_VERSION_UPDATE = "Version: ✅ Updated Eik version from v%s to v%s.";
const I_VERSION_NOT_NEEDED =
  "Version: ✅ Not needed as the current version of this package already contains these files.";
const I_PUBLISH_NOT_NEEDED =
  "Publish: ✅ Not needed as the current version of this package is already published.";
const I_PUBLISH_NEEDED =
  "Version: ✅ Not needed as the current Eik version not yet published.";
const E_SERVER_CONNECTION_ERROR =
  "Version: ❌ Unable to connect with Eik server.";
const E_VERSIONING_ERROR =
  "Version: ❌ Unable to perform versioning operation.";

/**
 * Semantic Release "Analyze Commits" hook
 * Responsible for determining the type of the next release (major, minor or patch). If multiple plugins with a analyzeCommits step are defined, the release type will be the highest one among plugins output.
 * See https://github.com/semantic-release/semantic-release/blob/master/docs/usage/plugins.md#plugins
 *
 * @param {object} options
 * @param {object} context
 * @param {object} state
 */
module.exports = async function analyzeCommits(options, context, state) {
  const { version: currentVersion, server, type, name } = state.eikJSON;

  // attempt to version Eik assets
  try {
    state.versionToPublish = await eik.version({
      name,
      version: currentVersion,
      type,
      files: state.eikJSON.files,
      server,
      cwd: context.cwd,
      level: options.level,
      map: state.eikJSON.map,
      out: state.eikJSON.out,
    });

    // successful versioning, publish is now needed
    context.logger.log(
      I_VERSION_UPDATE,
      currentVersion,
      state.versionToPublish
    );
    state.publishNeeded = true;
    return options.level || "patch";
  } catch (err) {
    // unsuccessful versioning, handle reason individually

    if (err.message.includes("Unable to fetch package metadata")) {
      context.logger.log(E_SERVER_CONNECTION_ERROR);
    }

    if (err.message.includes("Unable to hash local files for comparison")) {
      context.logger.log(E_VERSIONING_ERROR);
    }

    if (err.message.includes("package has not yet been published")) {
      state.publishNeeded = true;
      state.versionToPublish = currentVersion;
      context.logger.log(I_PUBLISH_NEEDED);
      return options.level || "patch";
    }

    if (err.message.includes("package already contains these files")) {
      context.logger.log(I_VERSION_NOT_NEEDED);
      state.publishNeeded = false;
      context.logger.log(I_PUBLISH_NOT_NEEDED);
      return null;
    }

    throw err;
  }
};
