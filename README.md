<div align="center">

<img src="desktop/app.iconset/icon_512@2x.png" width="128" max-width="25%" alt="Hyperspace Desktop icon" />

# Hyperspace Desktop

The new beautiful, fluffy client for the fediverse written in TypeScript and React

</div>

![Hyperspace Desktop on a MacBook Pro](screenshot.png)

[![Matrix room](https://img.shields.io/matrix/hypermasto:matrix.org.svg)](https://matrix.to/#/#hypermasto:matrix.org)
[![Discord server](https://img.shields.io/discord/554108687434907660.svg?color=blueviolet&label=discord)](https://discord.gg/c69AXwk)
![Build Status](https://github.com/hyperspacedev/hyperspace/workflows/Node%20CI/badge.svg) [![GitHub release (latest SemVer including pre-releases)](https://img.shields.io/github/v/release/hyperspacedev/hyperspace?include_prereleases)](https://github.com/hyperspacedev/hyperspace/releases) [![License: NPLv4+](https://img.shields.io/badge/license-NPLv4%2B-blue.svg)](LICENSE.txt) [![Hyperspace](https://snapcraft.io/hyperspace/badge.svg)](https://snapcraft.io/hyperspace)

Socialize and communicate with your friends in the fediverse (ActivityPub-powered social networks like Mastodon and Pleroma) with Hyperspace Desktop. Browse your timelines, check in with friends, and share your experiences across the fediverse in a beautiful, clean, and customizable way.

What Hyperspace Desktop offers:

-   A clean, responsive, and streamlined design that fits in with your Mac
-   Support for switching between accounts to access the accounts you use the most
-   Customization support, ranging from several beautiful themes to masonry layout and infinite scrolling
-   Powerful toot composer with media uploads, emojis, and polls
-   Activity and recommended views that give you insight on the community/instance you reside in

## Get started

Hyperspace Desktop is available for the major desktop platforms via our downloads page, GitHub, and other store platforms where applicable.

[**Download from our website &rsaquo;**](https://hyperspace.marquiskurt.net/download)

### Download from a store

[![Get on the Snap Store](https://snapcraft.io/static/images/badges/en/snap-store-black.svg)](https://snapcraft.io/hyperspace) [![Get on the Mac App Store](https://hyperspace.marquiskurt.net/assets/images/mas.svg)](https://apps.apple.com/us/app/hyperspace-desktop/id1454139710?mt=12)

**via [WinGet](https://github.com/microsoft/winget-cli)**:

```
winget install HyperspaceDesktop
```

## Build from source

To build Hyperspace Desktop, you'll need the following tools and packages:

-   Node.js v10 or later
-   (macOS-only) Xcode 10 or higher

### Installing dependencies

First, clone the repository from GitHub:

```
git clone https://github.com/hyperspacedev/hyperspace
```

Then, in the app directory, run the following command to install all of the package dependencies:

```
npm install
```

### Testing changes

Run any of the following scripts to test:

-   `npm start` - Starts a local server hosted at https://localhost:3000.
-   `npm run electron:build` - Builds a copy of the source code and then runs the app through Electron. Ensure that the `location` key in `config.json` points to `"desktop"` before running this.
-   `npm run electron:prebuilt` - Similar to `electron:build` but doesn't build the project before running.

The `location` key in `config.json` can take the following values during testing:

-   **https://localhost:3000**: Most suitable for running `npm start` or running via `react-scripts`.
-   **desktop**: Most suitable for when testing the desktop application.

> Note: Hyperspace Desktop v1.1.0-beta3 and older versions require the location field to be changed to `"https://localhost:3000"` before running.

### Building a release

To build a release, run the following command:

```
npm run build
```

The built files will be available under `build` as static files that can be hosted on a web server. If you plan to release these files alongside the desktop apps, compress these files in a ZIP.

#### Building desktop apps

You can run any of the following commands to build a release for the desktop:

-   `npm run build:desktop-all`: Builds the desktop apps for all platforms (eg. Windows, macOS, Linux). Will run `npm run build` before building.
-   `npm run build:win`: Builds the desktop app for Windows without running `npm run build`.
-   `npm run build:mac`: Builds the desktop apps for macOS without running `npm run build`. See the details below for more information on building for macOS.
-   `npm run build:mas`: Builds the desktop apps for the Mac App Store without running `npm run build`. See the details below for more information on building for macOS.
-   `npm run build:linux`: Builds the desktop apps for Linux (eg. Debian package, AppImage, and Snap) without running `npm run build`.
-   `npm run build:linux-select-targets`: Builds the desktop app for Linux without running `npm run build`. _Targets are required as parameters._

The built files will be available under `dist` that can be uploaded to your app distributor or website.

#### Extra steps for macOS

The macOS builds of Hyperspace Desktop require a bit more effort and resources to build and distribute accordingly. The following is a quick guide to building Hyperspace Desktop for macOS and for the Mac App Store.

##### Gather your tools

To create a code-signed and notarized version of Hyperspace Desktop, you'll need to acquire some provisioning profiles and certificates from a valid Apple Developer account.

For certificates, make sure your Mac has the following certificates installed:

-   3rd Party Mac Developer Application
-   3rd Party Mac Developer Installer
-   Developer ID Application
-   Developer ID Installer
-   Mac Developer

The easiest way to handle this is by opening Xcode and going to **Preferences &rsaquo; Accounts** and create the certificates from "Manage Certificates".

You'll also need to [create a provisioning profile for **Mac App Store** distribution](https://developer.apple.com/account/resources/profiles/add) and save it to the `desktop` folder as `embedded.provisonprofile`.

##### Create your entitlements files

You'll also need to create the entitlements files in the `desktop` directory that declares the permissions for Hyperspace Desktop. Replace `TEAM_ID` with the appropriate Apple Developer information and `BUNDLE_ID` with the bundle ID of your app.

###### entitlements.mac.plist

```plist
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.network.client</key>
    <true/>
    <key>com.apple.security.files.user-selected.read-write</key>
    <true/>
  </dict>
</plist>
```

###### entitlements.mas.plist

```plist
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>com.apple.security.cs.allow-jit</key>
	<true/>
	<key>com.apple.security.network.client</key>
	<true/>
	<key>com.apple.security.app-sandbox</key>
	<true/>
	<key>com.apple.security.cs.allow-unsigned-executable-memory</key>
	<true/>
	<key>com.apple.security.application-groups</key>
	<array>
		<string>TEAM_ID.BUNDLE_ID</string>
	</array>
	<key>com.apple.security.files.user-selected.read-only</key>
	<true/>
	<key>com.apple.security.files.user-selected.read-write</key>
	<true/>
</dict>
</plist>
```

###### entitlements.mas.inherit.plist

```plist
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
	<dict>
	<key>com.apple.security.app-sandbox</key>
	<true/>
	<key>com.apple.security.inherit</key>
	<true/>
	<key>com.apple.security.cs.allow-jit</key>
	<true/>
	<key>com.apple.security.cs.allow-unsigned-executable-memory</key>
	<true/>
	</dict>
</plist>
```

###### entitlements.mas.loginhelper.plist

```plist
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>com.apple.security.app-sandbox</key>
    <true/>
  </dict>
</plist>
```

###### info.plist

```plist
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>ElectronTeamID</key>
	<string>TEAM_ID</string>
	<key>com.apple.developer.team-identifier</key>
	<string>TEAM_ID</string>
	<key>com.apple.application-identifier</key>
	<string>TEAM_ID.BUNDLE_ID</string>
</dict>
</plist>
```

##### Edit `notarize.js`

You'll also need to edit `notarize.js` in the `desktop` directory. Replace `<TEAM_ID>`, `<BUNDLE_ID>`, and `<APPLE_DEVELOPER_EMAIL>` with the appropriate information from the app and your account from Apple Developer.

```js
// notarize.js
// Script to notarize Hyperspace for macOS
// © 2019 Hyperspace developers. Licensed under Apache 2.0.

const { notarize } = require("electron-notarize");

// This is pulled from the Apple Keychain. To set this up,
// follow the instructions provided here:
// https://github.com/electron/electron-notarize#safety-when-using-appleidpassword
const password = `@keychain:AC_PASSWORD`;

exports.default = async function notarizing(context) {
    const { electronPlatformName, appOutDir } = context;
    if (electronPlatformName !== "darwin") {
        return;
    }

    console.log("Notarizing Hyperspace...");

    const appName = context.packager.appInfo.productFilename;

    return await notarize({
        appBundleId: "<BUNDLE_ID>",
        appPath: `${appOutDir}/${appName}.app`,
        appleId: "<APPLE_DEVELOPER_EMAIL>",
        appleIdPassword: password,
        ascProvider: "<TEAM_ID>"
    });
};
```

Note that the password is pulled from your keychain. You'll need to create an app password and store it in your keychain as `AC_PASSWORD`.

##### Build the apps

Run any of the following commands to build Hyperspace Desktop for the Mac:

-   `npm run build:mac` - Builds the macOS app in a DMG container.
-   `npm run build:mac-unsigned` - Similar to `build:mac`, but skips code signing and notarization. **Use only for CI or in situations where code signing and notarization is not available.**
-   `npm run build:mas` - Builds the Mac App Store package.

## Licensing and Credits

Hyperspace Desktop is licensed under the [Non-violent Public License v4+](LICENSE.txt), a permissive license under the conditions that you do not use this for any unethical purposes and to file patent claims. Please read what your rights are as a Hyperspace Desktop user/developer in the license for more information.

Hyperspace Desktop has been made possible by the React, TypeScript, Megalodon, and Material-UI projects as well our [Patrons](patreon.md) and our contributors on GitHub.

## Contribute

Contribution guidelines are available in the [contributing file](.github/contributing.md) and when you make an issue/pull request. Additionally, you can access our [Code of Conduct](.github/code_of_conduct.md).

If you want to aid the project in other ways, consider supporting the project on [Patreon](https://patreon.com/hyperspacedev).
