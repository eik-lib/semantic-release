# Eik Semantic Release Plugin

This plugin will first determine if a repo has changes to relevant files before versioning and publishing these files to an Eik server.

N.B. Currently, this plugin expects that your Eik project uses an `eik.json` file (rather than configuration in `package.json`)

## Setup

1. Setup Semantic Release as per guides

https://semantic-release.gitbook.io/semantic-release/usage/getting-started

### Consider using the interactive CLI

```
npx semantic-release-cli setup
```

2. Install plugins

```
npm install -D @eik/semantic-release @semantic-release/git
```

3. Create/edit `release.config.js` file to load plugins

```js
export default {
    plugins: [
        '@eik/semantic-release',
        ['@semantic-release/git', { assets: ['eik.json'] }],
    ],
};
```

## Plugin Environment Variables

This plugin expects the following environment variable to be present.

| Name      | Description                 |
| --------- | --------------------------- |
| EIK_TOKEN | Access token for Eik server |
