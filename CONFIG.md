# Hyperspace 1.0 Configuration File

Hyperspace 1.0 comes with a new configuration file app providers can use to create a custom experience relatively easy. This is inspired from the way the [Riot](https://github.com/vector-im/riot-web) project handles configurations for their app. The following fields should be in the `config.json` folder at the root of the Hyperspace installation.

- `version`: The app's version using semantic versioning. This can be used to differentiate between versions of the main Hyperspace app or the custom deployment.
- `branding`: The custom branding for Hyperspace.
  - `name`: The name for the brand/app. Affects title bar, about screens, and main interface by replacing the "Hyperspace" text.
  - `logo`: The filepath of the brand's logo, relative to the deployment folder. Can be a relative path (`brand/logo.png`) or a URL (`https://www.test.com/brands/logo-hs.png`).
  - `background`: The background used on the login page. Can be a relative path (`brand/bg.png`) or a URL (`https://www.test.com/brands/bg-hs.png`)
- `developer`: Whether the version is a developer version or should be put in developer mode. Used to signify unstable releases with new features to play around with.
- `federated`: Whether Hyperspace should enable federating features in its interface for Mastodon. Disabling federation disables the public timeline.
- `registration`: Information regarding registration of accounts.
  - `defaultInstance`: The host name of the instance to default to when making accounts. Affects "well-known" sign-in and 'Create account' buttons
- `admin`: Information about the app provider/administrator:
  - `name`: The name of the app provider
  - `account`: The Account ID of the app provider on Mastodon, in-instance or not
- `license`: Licensing information about the app. Will default to Apache 2.0 if not listed (the standard license for Hyperspace source code).
  - `name`: The name of the license.
  - `url`: The link to the license for reviewing.

## Example Config File

```json
{
    "version": "1.0.0beta1",
    "branding": {
        "name": "Hyperspace",
        "logo": "logo.svg",
        "background": "background.png"
    },
    "developer": "true",
    "federated": "true",
    "registration": {
        "defaultInstance": "mastodon.social"
    },
    "admin": {
        "name": "Eugen",
        "account": "1"
    },
    "license": {
        "name": "Apache 2.0 License",
        "url": "https://www.apache.org/licenses/LICENSE-2.0"
    }
}
```