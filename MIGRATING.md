# Differences between Hyperspace 1.0 and Hyperspace Classic (0.x)

The 1.0 redesign of Hyperspace acts differently from the current classic version of in multiple ways:

- **Pages over panels**. Hyperspace 1.0 uses `react-router-dom` to link components of the app via URLs instead of individual components. This means that one could visit the corresponding URL instead of needing to open a set of panels or buttons to do so.
- **Material design**. Hyperspace 1.0 uses Material Design to create a UI that scales across device types. The library used for the UI, `material-ui`, natively supports a dark mode and themes, making Hyperspace 1.0 more customizable in nature.
- **Less intrusive by nature.** Hyperspace 1.0 pushes notifications when the window isn't in focus versus all the time, and the snackbar (toast) notifications are displayed more often when something is happening or when an error occurs. Timelines also no longer keep pushing posts during streaming, letting anyone read the timeline and still be able to get updates with a non-intrusive `View (x) new posts` chip at the top.
- **Configurable at every level.** Hyperspace 1.0 allows anyone to customize their theme and settings to however they like, and admins can customize Hyperspace further with branding, federation support, registration URLs, and more (done via `config.json`). [Learn more &rsaquo;](https://hyperspace.marquiskurt.net/docs/configure-hyperspace)

This is a growing list and new things will be added over time.