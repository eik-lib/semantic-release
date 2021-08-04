const { join } = require("path");
const fetch = require("node-fetch");
const eik = require("@eik/cli");
const common = require("@eik/common");
const verifyConditions = require("./lib/verify-conditions");
const analyzeCommits = require("./lib/analyze-commits");
const verifyRelease = require("./lib/verify-release");
const generateNotes = require("./lib/generate-notes");
const prepare = require("./lib/prepare");

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

module.exports.verifyRelease = (options, context) =>
  verifyRelease(options, context, state);

module.exports.generateNotes = (options, context) =>
  generateNotes(options, context, state);

module.exports.prepare = (options, context) => prepare(options, context, state);

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
