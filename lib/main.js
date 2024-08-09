import verifyConditions from "./verify-conditions.js";
import analyzeCommits from "./analyze-commits.js";
import verifyRelease from "./verify-release.js";
import generateNotes from "./generate-notes.js";
import prepare from "./prepare.js";
import publish from "./publish.js";
import success from "./success.js";
import { State } from "./state.js";

const state = new State();

export default {
	verifyConditions: (options, ctx) => verifyConditions(options, ctx, state),
	analyzeCommits: (options, ctx) => analyzeCommits(options, ctx, state),
	verifyRelease: (options, ctx) => verifyRelease(options, ctx, state),
	generateNotes: (options, ctx) => generateNotes(options, ctx, state),
	prepare: (options, ctx) => prepare(options, ctx, state),
	publish: (options, ctx) => publish(options, ctx, state),
	success: (options, ctx) => success(options, ctx, state),
};
