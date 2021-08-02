const { join } = require("path");
const fetch = require("node-fetch");
const eik = require("@eik/cli");
const common = require("@eik/common");
const json = require("@eik/cli/utils/json");
const verifyConditions = require("./lib/verify-conditions");
const analyzeCommits = require("./lib/analyze-commits");

class State {
  eikToken = "";
  eikJSON = {};
  versionToPublish = null;
  publishNeeded = null;
}

const state = new State();

module.exports.verifyConditions = (options, context) =>
  verifyConditions(options, context, state);

module.exports.analyzeCommits = (options, context) =>
  analyzeCommits(options, context, state);

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
