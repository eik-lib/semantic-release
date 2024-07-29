const AggregateError = require('aggregate-error');
const eik = require('@eik/cli');
const { configStore } = require('@eik/common-config-loader');

const E_TOKEN_MISSING = 'Verify: ❌ EIK_TOKEN environment variable not found';
const E_LEVEL_INVALID =
    'Verify: ❌ Plugin option "level" must be one of "major", "minor" or "patch", "%s" given.';
const E_LOGIN_FAIL = 'Verify: ❌ Unable to log in to Eik server';
const LEVELS = ['major', 'minor', 'patch'];

/**
 * Semantic Release "verify conditions" hook
 * "Verify all the conditions to proceed with the release."
 * See https://github.com/semantic-release/semantic-release/blob/master/docs/usage/plugins.md#plugins
 *
 * @param {object} options
 * @param {object} context
 * @param {object} state
 */
module.exports = async function verifyConditions(options, context, state) {
    const errors = [];

    // verify EIK_TOKEN present in the environment
    if (!context.env.EIK_TOKEN) errors.push(new Error(E_TOKEN_MISSING));

    // verify options.level is one of "major", "minor" or "patch" if set
    if (!LEVELS.includes(options.level || 'patch')) {
        errors.push(new Error(E_LEVEL_INVALID.replace('%s', options.level)));
    }

    // verify existance of and validity of eik.json file AND read contents
    try {
        state.eikJSON = configStore.findInDirectory(context.cwd);
    } catch (err) {
        errors.push(err);
    }

    // login to Eik server and save resulting token in state for later hooks
    state.eikToken = await eik.login({
        server: state.eikJSON.server,
        key: context.env.EIK_TOKEN,
    });
    // verify login succeeded
    if (!state.eikToken) errors.push(new Error(E_LOGIN_FAIL));

    if (errors.length > 0) {
        throw new AggregateError(errors);
    }
};
