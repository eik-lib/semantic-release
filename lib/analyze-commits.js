const { join } = require("path");
const fetch = require("node-fetch");
const eik = require("@eik/cli");
const common = require("@eik/common");

const messages = {
  IVERSIONUPDATE: "Version: ✅ Updated Eik version from v%s to v%s.",
  IVERSIONNOTNEEDED:
    "Version: ✅ Not needed as the current version of this package already contains these files.",
  IPUBLISHNOTNEEDED:
    "Publish: ✅ Not needed as the current version of this package is already published.",
  IPUBLISHNEEDED:
    "Version: ✅ Not needed as the current Eik version not yet published.",
};

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
    context.logger.log(
      messages.IVERSIONUPDATE,
      currentVersion,
      state.versionToPublish
    );
    state.publishNeeded = true;
    return options.level || "patch";
  } catch (err) {
    context.logger.log(messages.IVERSIONNOTNEEDED);
  }

  // check if the current version is already published
  const url = new URL(
    join(common.helpers.typeSlug(type), name, currentVersion),
    server
  );
  url.searchParams.set("ts", Date.now());
  const result = await fetch(url);

  // current version is published already
  if (result.ok) {
    state.publishNeeded = false;
    context.logger.log(messages.IPUBLISHNOTNEEDED);
    return null;
  }

  // current version is not yet published
  state.publishNeeded = true;
  state.versionToPublish = currentVersion;
  context.logger.log(messages.IPUBLISHNEEDED);
  return options.level || "patch";
};
