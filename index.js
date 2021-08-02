const { join } = require("path");
const fetch = require("node-fetch");
const eik = require("@eik/cli");
const common = require("@eik/common");
const json = require("@eik/cli/utils/json");
const verifyConditions = require("./lib/verify-conditions");

class State {
  eikToken = "";
  eikJSON = {};
  versionToPublish = null;
  publishNeeded = null;
}

const state = new State();

module.exports.verifyConditions = (options, context) =>
  verifyConditions(options, context, state);

module.exports.analyzeCommits = async function analyzeCommits(
  options,
  context
) {
  const { cwd, logger } = context;
  const {
    version: currentVersion,
    server,
    type,
    name,
    files,
    map,
    out,
  } = state.eikJSON;

  try {
    state.versionToPublish = await eik.version({
      name,
      version: currentVersion,
      type,
      files,
      server,
      cwd,
      level: options.level,
      map,
      out,
    });
    logger.log(
      `Eik version updated from v${currentVersion} to v${state.versionToPublish}.`
    );
    state.publishNeeded = true;
    return options.level || "patch";
  } catch (err) {
    logger.log(err.message);
  }

  const url = new URL(
    join(common.helpers.typeSlug(type), name, currentVersion),
    server
  );
  url.searchParams.set("ts", Date.now());
  const result = await fetch(url);
  if (result.ok) {
    state.publishNeeded = false;
    logger.log(
      `The current version of this package is already published. Publishing is not needed.`
    );
    return null;
  }

  state.publishNeeded = true;
  state.versionToPublish = currentVersion;
  logger.log(
    `Current Eik version not yet published. Versioning change is not needed.`
  );
  return options.level || "patch";
};

module.exports.verifyRelease = async function verifyRelease(options, context) {
  if (!state.publishNeeded) return;
  const { cwd, logger } = context;

  try {
    const { server, name, files, type, map, out } = state.eikJSON;
    const result = await eik.publish({
      name,
      type,
      server,
      files,
      cwd,
      token: state.eikToken,
      dryRun: true,
      version: state.versionToPublish,
      map,
      out,
    });

    const filesToBePublished = result.files.filter(
      (file) => file.type === "package file"
    );
    if (!filesToBePublished.length) {
      throw new Error(
        `No files detected for upload. Did you run bundling first (if needed)? Is the "files" field of eik.json correct?`
      );
    }
    logger.log("Found %d file(s) to publish", filesToBePublished.length);
  } catch (err) {
    logger.log("Verification checks failed to complete");
    throw err;
  }
};

module.exports.generateNotes = async function generateNotes() {
  if (!state.publishNeeded) return;
  return `New Eik package version ${state.versionToPublish} published.`;
};

module.exports.prepare = async function prepare(options, context) {
  if (!state.publishNeeded) return;
  const { cwd, logger } = context;
  if (state.eikJSON.version !== state.versionToPublish) {
    logger.log(`Version ${state.versionToPublish} written to eik.json`);
    await json.writeEik({ version: state.versionToPublish }, { cwd });
  }
};

module.exports.publish = async function publish(options, context) {
  if (!state.publishNeeded) return;
  const { cwd, logger } = context;
  try {
    const { server, name, files, type, map, out } = state.eikJSON;
    const result = await eik.publish({
      name,
      type,
      server,
      files,
      cwd,
      token: state.eikToken,
      dryRun: false,
      version: state.versionToPublish,
      map,
      out,
    });

    const filesPublished = result.files.filter((file) => file.type === "pkg");
    logger.log(
      `Published ${filesPublished.length} file(s) to Eik server ${state.eikJSON.server}`
    );
  } catch (err) {
    logger.log(
      "Publish to Eik server failed. This may leave your build in a broken state. If retrying the build fails, try pushing a new commit."
    );
    throw err;
  }
};

module.exports.success = async function success(options, context) {
  if (!state.publishNeeded) return;
  const { logger } = context;
  const { server, name, type } = state.eikJSON;
  const url = new URL(
    join(common.helpers.typeSlug(type), name, state.versionToPublish),
    server
  );
  url.searchParams.set("ts", Date.now());
  const result = await fetch(url);
  if (result.ok) {
    logger.log(
      `Successfully published package ${name} (v${state.versionToPublish}) to ${url.href}.`
    );
  } else {
    logger.log(
      `Unable to locate package ${name} (v${state.versionToPublish}) at ${url.href}. It appears something went wrong during publish.`
    );
  }
};
