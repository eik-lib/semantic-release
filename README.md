# Eik Semantic Release Plugin

This plugin will first determine if a repo has changes to relevant files before versioning and publishing these files to an Eik server.

It can be used as part of an existing Semantic Release workflow or as a stand alone setup.

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
module.exports = {
  plugins: [
    "@eik/semantic-release",
    ["@semantic-release/git", { assets: ["eik.json"] }],
  ],
};
```

## Plugin Environment Variables

| Name      | Description                 |
| --------- | --------------------------- |
| EIK_TOKEN | Access token for Eik server |
