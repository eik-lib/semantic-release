const { join } = require("path");
const AggregateError = require("aggregate-error");
const fetch = require("node-fetch");
const eik = require("@eik/cli");
const common = require("@eik/common");
const json = require("@eik/cli/utils/json");

let eikToken = "";
let eikjson = {};
let versionToPublish;
let publishNeeded;

module.exports.verifyConditions = async function verifyConditions(
  options,
  context
) {
  const { env, cwd } = context;
  const errors = [];

  if (!env.EIK_TOKEN)
    errors.push(new Error("EIK_TOKEN environment variable not found"));

  if (!["major", "minor", "patch"].includes(options.level || "patch")) {
    errors.push(
      new Error(
        'plugin option "level" must be one of "major", "minor" or "patch"'
      )
    );
  }

  try {
    eikjson = common.helpers.configStore.findInDirectory(cwd);
  } catch (err) {
    errors.push(err);
  }

  eikToken = await eik.login({ server: eikjson.server, key: env.EIK_TOKEN });
  if (!eikToken) errors.push(new Error("Unable to log in to Eik server"));

  if (errors.length > 0) {
    throw new AggregateError(errors);
  }
};

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
  } = eikjson;

  try {
    versionToPublish = await eik.version({
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
      `Eik version updated from v${currentVersion} to v${versionToPublish}.`
    );
    publishNeeded = true;
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
    publishNeeded = false;
    logger.log(
      `The current version of this package is already published. Publishing is not needed.`
    );
    return null;
  }

  publishNeeded = true;
  versionToPublish = currentVersion;
  logger.log(
    `Current Eik version not yet published. Versioning change is not needed.`
  );
  return options.level || "patch";
};

module.exports.verifyRelease = async function verifyRelease(options, context) {
  if (!publishNeeded) return;
  const { cwd, logger } = context;

  try {
    const { server, name, files, type, map, out } = eikjson;
    const result = await eik.publish({
      name,
      type,
      server,
      files,
      cwd,
      token: eikToken,
      dryRun: true,
      version: versionToPublish,
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
  if (!publishNeeded) return;
  return `New Eik package version ${versionToPublish} published.`;
};

module.exports.prepare = async function prepare(options, context) {
  if (!publishNeeded) return;
  const { cwd, logger } = context;
  if (eikjson.version !== versionToPublish) {
    logger.log(`Version ${versionToPublish} written to eik.json`);
    await json.writeEik({ version: versionToPublish }, { cwd });
  }
};

module.exports.publish = async function publish(options, context) {
  if (!publishNeeded) return;
  const { cwd, logger } = context;
  try {
    const { server, name, files, type, map, out } = eikjson;
    const result = await eik.publish({
      name,
      type,
      server,
      files,
      cwd,
      token: eikToken,
      dryRun: false,
      version: versionToPublish,
      map,
      out,
    });

    const filesPublished = result.files.filter((file) => file.type === "pkg");
    logger.log(
      `Published ${filesPublished.length} file(s) to Eik server ${eikjson.server}`
    );
  } catch (err) {
    logger.log(
      "Publish to Eik server failed. This may leave your build in a broken state. If retrying the build fails, try pushing a new commit."
    );
    throw err;
  }
};

module.exports.success = async function success(options, context) {
  if (!publishNeeded) return;
  const { logger } = context;
  const { server, name, type } = eikjson;
  const url = new URL(
    join(common.helpers.typeSlug(type), name, versionToPublish),
    server
  );
  url.searchParams.set("ts", Date.now());
  const result = await fetch(url);
  if (result.ok) {
    logger.log(
      `Successfully published package ${name} (v${versionToPublish}) to ${url.href}.`
    );
  } else {
    logger.log(
      `Unable to locate package ${name} (v${versionToPublish}) at ${url.href}. It appears something went wrong during publish.`
    );
  }
};
