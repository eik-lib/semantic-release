import tap from "tap";
import plugin from "../lib/main.js";

tap.test("Simple test", (t) => {
	t.type(plugin.verifyConditions, "function");
	t.type(plugin.analyzeCommits, "function");
	t.type(plugin.verifyRelease, "function");
	t.type(plugin.generateNotes, "function");
	t.type(plugin.prepare, "function");
	t.type(plugin.publish, "function");
	t.type(plugin.success, "function");
	t.end();
});
