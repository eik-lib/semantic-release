const verifyConditions = require("./verify-conditions");
const analyzeCommits = require("./analyze-commits");
const verifyRelease = require("./verify-release");
const generateNotes = require("./generate-notes");
const prepare = require("./prepare");
const publish = require("./publish");
const success = require("./success");

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
