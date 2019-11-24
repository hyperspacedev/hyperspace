<p align="center">
    <img src="desktop/app.iconset/icon_512@2x.png" width="128" max-width="25%" alt=“Hyperspace” />
</p>
<h1 align="center">Hyperspace</h1>

<p align="center">The new beautiful, fluffy client for the fediverse written in TypeScript and React</p>

![Hyperspace 1.0 on a MacBook Pro](screenshot.png)

[![Matrix room](https://img.shields.io/matrix/hypermasto:matrix.org.svg)](https://matrix.to/#/#hypermasto:matrix.org)
[![Discord server](https://img.shields.io/discord/554108687434907660.svg?color=blueviolet&label=discord)](https://discord.gg/c69AXwk)
![Build Status](https://github.com/hyperspacedev/hyperspace/workflows/Node%20CI/badge.svg) [![GitHub release (latest SemVer including pre-releases)](https://img.shields.io/github/v/release/hyperspacedev/hyperspace?include_prereleases)](https://github.com/hyperspacedev/hyperspace/releases) <!-- [![iTunes App Store](https://img.shields.io/itunes/v/1454139710?label=Mac%20App%20Store&logo=apple&logoColor=white)](https://apps.apple.com/us/app/hyperspace/id1454139710?mt=12)--> [![Hyperspace](https://snapcraft.io/hyperspace/badge.svg)](https://snapcraft.io/hyperspace)

Hyperspace is the fluffiest client for Mastodon and other fediverse networks written in TypeScript and React. Hyperspace offers a fun, clean, fast, and responsive design that scales beautifully across devices and enhances the fediverse experience.

## Features

-   **Responsive by design**: Hyperspace is beautifully designed to put your content front and center and bring a familiar experience to Mastodon. View threads and profiles with ease and compose anywhere with the compose button. And, of course, Hyperspace scales across devices beautifully, providing the same experience anywhere.
-   **Customizable**: Hyperspace allows customization and configuration at every level, from the server level with branding and instance setup, down to the user level with dark mode, custom themes, and multi-user account support. And, if the default configuration settings aren't enough, anyone can make their own version of Hyperspace with custom additions.
-   **Open-source**: Hyperspace is free (libre) and open-source software. Licensed under the Non-Violent Public License, anyone can modify, redistribute, or contribute to the Hyperspace project without restriction. Hyperspace is written in TypeScript and takes advantage of multiple open-source libraries and projects such as React, Megalodon, and Material-UI, so web and Node.js developers will feel right at home.

> If you've used Hyperspace 0.x, you'll note many changes with the 1.x and later series. You can learn more about these changes in the [migration article](MIGRATING.md).

## Downloads

Hyperspace is available for download on GitHub as well as other platforms.

[**Get latest release &rsaquo;**](https://github.com/hyperspacedev/hyperspace/releases/latest)

<!--[![Get on the Mac App Store](https://hyperspace.marquiskurt.net/images/mas.svg)](https://itunes.apple.com/us/app/hyperspace/id1454139710?mt=12)-->

[![Get on the Snap Store](https://snapcraft.io/static/images/badges/en/snap-store-black.svg)](https://snapcraft.io/hyperspace)

Looking for the Mac App Store version? [Read more &rsaquo;](https://hyperspace.marquiskurt.net/2019/11/08/post.html)

## Build instructions

### Prerequisites

To develop Hyperspace, you'll need the following tools and packages:

-   Node.js 8 or later

### Installing dependencies

First, clone the repository from GitHub:

```bash
git clone https://github.com/hyperspacedev/hyperspace
```

Then, in the app directory, run the following command to install all of the package dependencies:

```npm
npm install
```

### Testing changes

Before testing Hyperspace, you'll need to modify the `location` key in `public/config.json`. For example:

```json
    "location": "https://localhost:3000"
```

The `location` key can take the following values during testing:

-   **https://localhost:3000**: Most suitable for running `npm start` or running via `react-scripts`.
-   **desktop**: Most suitable for when testing the desktop application.

After changing this setting, run any of the following scripts to test:

-   `npm start` - Starts a local server hosted at https://localhost:3000.
-   `npm run electrify` - Builds a copy of the source code and then runs the app through Electron. Ensure that the `location` key in `config.json` points to `"desktop"` before running this.
-   `npm run electrify-nobuild` - Similar to `electrify` but doesn't build the project before running.

### Building a release

To build a release, run the following command:

```npm
npm run build
```

The built files will be available under `build` as static files that can be hosted on a web server. If you plan to release these files alongside the desktop apps, compress these files in a ZIP.

#### Building desktop releases

You can run any of the following commands to build a release for the desktop:

-   `npm run build-desktop`: Builds the desktop apps for all platforms (eg. Windows, macOS, Linux). Will run `npm run build` before building.
-   `npm run build-desktop-win`: Builds the desktop app for Windows without running `npm run build`.
-   `npm run build-desktop-darwin`: Builds the desktop apps for macOS (eg. disk image, Mac App Store) without running `npm run build`. See the details below for more information on building for macOS.
-   `npm run build-desktop-linux`: Builds the desktop apps for Linux (eg. Debian package, AppImage, and Snap) without running `npm run build`.
-   `npm run build-desktop-linux-select`: Builds the desktop app for Linux without running `npm run build`. _Target is required as a parameter._

The built files will be available under `dist` that can be uploaded to your app distributor or website.

#### Building for macOS

More recent version of macOS require that the Hyperspace desktop app be both digitally code-signed and notarized (uploaded to Apple to check for malware). Hyperspace includes the tools necessary to automate this process when building the macOS version either by `npm run build-desktop` or by `npm run build-desktop-darwin`.

Make sure you have your provisioning profiles for the Mac App Store (`embedded.provisionprofile`) and standard distribution (`nonmas.provisionprofile`) in the `desktop` directory. These provision profiles can be obtained through Apple Developer. You'll also need to create entitlements files in the `desktop` directory that list the following entitlements for your app:

-   `com.apple.security.app-sandbox`
-   `com.apple.security.files.downloads.read-write`
-   `com.apple.security.files.user-selected.read-write`
-   `com.apple.security.allow-unsigned-executable-memory`
-   `com.apple.security.network.client`

For the child ones (inherited `entitlements.mas.inherit.plist`):

-   `com.apple.security.app-sandbox`
-   `com.apple.security.inherit`
-   `com.apple.security.files.downloads.read-write`
-   `com.apple.security.files.user-selected.read-write`
-   `com.apple.security.allow-unsigned-executable-memory`
-   `com.apple.security.network.client`

> ⚠️ Note that the inherited permissions are the same as that of the parent. This is due to an issue where the hardened runtime fails to pass down the inherited properties (see [electron/electron#20560](https://github.com/electron/electron/issues/20560#issuecomment-546110018)). This might change in future versions of macOS.

It is also recommended to add the `com.apple.security.applications-groups` entry with your bundle's identifier. You'll also need to create an `info.plist` in the `desktop` directory containing the team identifier and application identifier and install the developer certificates on the Mac you plan to build from.

You'll also want to modify the `notarize.js` file to change the details from the default to your App Store Connect account details and app identifier.

> ⚠️ **Warning**: The package.json file also includes the `build-desktop-darwin-nosign` script. This script is specifically intended for automated systems that cannot run notarization (Azure Pipelines, GitHub Actions, etc.). _Do not use this command to build production-ready versions of Hyperspace_.

## Licensing and Credits

Hyperspace is licensed under the [Non-violent Public License](LICENSE), a permissive license under the conditions that you do not use this for any unethical purposes and to file patent claims. Please read what your rights are as a Hyperspace user/developer in the license for more information.

Hyperspace has been made possible by the React, TypeScript, Megalodon, and Material-UI projects as well our [Patrons](patreon.md) and our contributors on GitHub.

## Contribute

Contrubition guidelines are available in the [contributing file](.github/contributing.md) and when you make an issue/pull request. Additionally, you can access our [Code of Conduct](.github/code_of_conduct.md).

If you want to aid the project in other ways, consider supporting the project on [Patreon](https://patreon.com/hyperspacedev).
