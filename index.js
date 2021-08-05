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

module.exports = {
  verifyConditions: (options, ctx) => verifyConditions(options, ctx, state),
  analyzeCommits: (options, ctx) => analyzeCommits(options, ctx, state),
  verifyRelease: (options, ctx) => verifyRelease(options, ctx, state),
  generateNotes: (options, ctx) => generateNotes(options, ctx, state),
  prepare: (options, ctx) => prepare(options, ctx, state),
  publish: (options, ctx) => publish(options, ctx, state),
  success: (options, ctx) => success(options, ctx, state),
};
