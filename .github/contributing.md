# Hyperspace Contribution Guidelines (version 2)

Thank you for contributing to Hyperspace! To make the contribution process quick, smooth, easy, and fun, we've devised a set of guidelines. Please consult these when making a pull request, issue, etc.

## General Code Guidelines

These guidelines apply to code that is written in Hyperspace.

### Declare styles with components (NEW)

Hyperspace 1.0 uses the [Material-UI](https://material-ui.com) framework to create beautiful design that scales across devices. Part of using this framework includes defining styles right inside of the code as [JSS](https://material-ui.com/getting-started/faq/#do-i-have-to-use-jss-to-style-my-app). As such, we recommend adding a file dedicated to your styles in the component's folder and writing in the styles accordingly.

### If possible, use a type

Hyperspace uses custom types via [TypeScript](https://www.typescriptlang.org/) to specify variables, parameters, and other parts of code to prevent ambiguity. If it is possible to use an existing type from `src/types` (or other types from project libraries) or make a new type, use it. Otherwise, use `any` as the type.

Suffice to say, this also means that new components or code _should_ be written in TypeScript files (.ts, .tsx) unless there is a compatibility issue that prevents this from working properly.

### Keep code organized

The Hyperspace structure is organized based on utilities, components, tests, and other types of files to make everything easy to locate. Please try to keep this organization when making a new component or test.

### Prettify your files (pretty please)

Hyperspace includes configurations for using the Prettier code formatter to format code in the project. Please ensure your code has been properly formatted by Prettier before submitting any to a pull request.

## Issues

These guidelines apply to issues on GitHub.

### Be as descriptive and concise as possible

So that Hyerpspace contributors and developers can better understand what the issue or request may be, issue descriptions should be concise but also descrptive. Refrain from writing an issue in a convoluted way that confuses others.

Additionally, if you feel using a screenshot or video will better illustrate your description, add them in conjuction with (or to replace) the description. Remember to consult the [Screenshot Guidelines](#screenshots).

### Label your issue during creation

Issues are categorized by types such as `bug`, `enhancement`, `question`, etc. by contributors that can access labels. Since it isn't possible to tag an issue during creation, prepend the tag to your issue's title.

> Example: [Enhancement request] Support settings sync with TorielDB

## Pull Requests

These guides apply to pull requests on GitHub.

### Describe all of your changes

Pull requests generally include many changes that address a particular problem or a set of problems. Explain all of the changes you made, but refrain from listing all of these changes as commit messages.

> Example:
> This PR makes the following changes:
>
> - Custom emojis from the user's server can be used in a post by typing its shortcode or inserting it through the new emoji picker*.
> - Posts and profile names display custom emoji.
> - A new utility, emojifyHTML, will automatically replace emoji shortcodes with img elements.

### Reference existing issues and PRs

If applicable, pull requests will reference the issues they are fixing in the description. This helps organize contributions in a few ways:

- Automates closing issues when they are fixed
- Verifies that the pull request fixes the issue(s) in question
- Makes a reference in the issue's thread for context

If there are any documented issues that the pull request addresses, reference them in the description of the pull request.

> Example:
>
> - Use TorielDB to sync data (fixes #1)

### (Optional) Sign-off your code

Hyperspace contributors try to credit pull request contributors in release notes as a way of saying thanks. Another way to ensure that we credit the right person if by signing-off your code. This can be done either in the pull request's description or the latest commit pushed to branch linked with the pull request:

```
Signed-off-by: Your Name <youremail@email.com>
```

This isn't required but is good practice to confirm that you wrote the code so we can credit it accordingly.

## Screenshots

These guidelines apply to screenshots that are used for reference in issues and/or pull requests.

### Respect the post author's visibility

Mastodon supports posting to four different visibility levels. As a means of respecting privacy, please keep in mind the following:

- Do not post a status published as a direct message, followers-only, or unlisted status _unless_ you have explicit permission from the status author.
  - If you made a direct message to yourself to demo a feature or fix a bug present in a post, you do not need to worry.
- If you are unsure whether a public status should be included in a screenshot, consult the post author.

### Ensure screenshots are clear

Screenshots are often included to help illustrate or demonstrate a point with an issue or pull request. It may be difficult to understand the screenshot's purpose if the image is too small or distorted. Ensure that all screenshots are clear and visible.