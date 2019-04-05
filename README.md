# Hyperspace v1.0

The new beautiful, fluffy client for Mastodon written in TypeScript and React

![Screenshot](screenshot.png)

This is the official repository for the Hyperspace 1.0 release. This release includes many more changes and will include a redesign that accomodates for desktop and mobile devices.

> Note: This version is _NOT_ production-ready. Rather, this version is under heavy development and will take a while to match feature parity with the current releases of Hyperspace.

If you are looking for the **current** release of Hyperspace, please look at [hyperspace-classic](https://github.com/hyperspacedev/hyperspace-classic).

## What makes Hyperspace 1.0 different from the current version?

The 1.0 redesign of Hyperspace acts differently from the current classic version of in multiple ways:

- **Pages over panels**. Hyperspace 1.0 uses `react-router-dom` to link components of the app via URLs instead of individual components. This means that one could visit the corresponding URL instead of needing to open a set of panels or buttons to do so.
- **Material design**. Hyperspace 1.0 uses Material Design to create a UI that scales across device types. The library used for the UI, `material-ui`, natively supports a dark mode and themes, making Hyperspace 1.0 more customizable in nature.
- **Less intrusive by nature.** Hyperspace 1.0 pushes notifications when the window isn't in focus versus all the time, and the snackbar (toast) notifications are displayed more often when something is happening or when an error occurs. Timelines also no longer keep pushing posts during streaming, letting anyone read the timeline and still be able to get updates with a non-intrusive `View (x) new posts` chip at the top.

This is a growing list and new things will be added over time.