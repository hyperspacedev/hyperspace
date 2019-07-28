// notarize.js
// Script to notarize Hyperspace for macOS
// © 2019 Hyperspace developers. Licensed under Apache 2.0.

const { notarize } = require('electron-notarize');

// This is pulled from the Apple Keychain. To set this up,
// follow the instructions provided here: 
// https://github.com/electron/electron-notarize#safety-when-using-appleidpassword
const password = `@keychain:AC_PASSWORD`;

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;  
  if (electronPlatformName !== 'darwin') {
    return;
  }

  console.log("Notarizing Hyperspace...");

  const appName = context.packager.appInfo.productFilename;

  return await notarize({
    appBundleId: 'net.marquiskurt.hyperspace',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: "appleseed@marquiskurt.net",
    appleIdPassword: password,
    ascProvider: "FQQXSP79X3"
  });
};