const { join } = require("path");
const fetch = require("node-fetch");
const common = require("@eik/common");
const verifyConditions = require("./lib/verify-conditions");
const analyzeCommits = require("./lib/analyze-commits");
const verifyRelease = require("./lib/verify-release");
const generateNotes = require("./lib/generate-notes");
const prepare = require("./lib/prepare");
const publish = require("./lib/publish");

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

module.exports.publish = (options, context) => publish(options, context, state);

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
