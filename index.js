const verifyConditions = require("./lib/verify-conditions");
const analyzeCommits = require("./lib/analyze-commits");
const verifyRelease = require("./lib/verify-release");
const generateNotes = require("./lib/generate-notes");
const prepare = require("./lib/prepare");
const publish = require("./lib/publish");
const success = require("./lib/success");

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

module.exports.success = (options, context) => success(options, context, state);
