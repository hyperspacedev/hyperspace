import { Theme, createStyles } from "@material-ui/core";
import { isDarwinApp } from "../utilities/desktop";
import { isAppbarExpanded } from "../utilities/appbar";

export const styles = (theme: Theme) =>
    createStyles({
        root: {
            width: "100%",
            display: "flex",
            height: "100%"
        },
        pageLayoutConstraints: {
            marginTop: 72,
            flexGrow: 1,
            padding: theme.spacing.unit * 3,
            paddingLeft: theme.spacing.unit,
            paddingRight: theme.spacing.unit,
            [theme.breakpoints.up("md")]: {
                marginLeft: 250,
                marginTop: 88,
                paddingLeft: theme.spacing.unit * 24,
                paddingRight: theme.spacing.unit * 24
            },
            backgroundColor: theme.palette.background.default,
            minHeight: isDarwinApp() ? "100vh" : "auto"
        },
        pageLayoutMaxConstraints: {
            marginTop: 72,
            flexGrow: 1,
            paddingTop: theme.spacing.unit * 2,
            padding: theme.spacing.unit,
            [theme.breakpoints.up("md")]: {
                marginLeft: 250,
                marginTop: 88,
                padding: theme.spacing.unit * 3,
                paddingLeft: theme.spacing.unit * 16,
                paddingRight: theme.spacing.unit * 16
            },
            [theme.breakpoints.up("lg")]: {
                marginLeft: 250,
                marginTop: 88,
                padding: theme.spacing.unit * 3,
                paddingLeft: theme.spacing.unit * 32,
                paddingRight: theme.spacing.unit * 32
            },
            [theme.breakpoints.up("xl")]: {
                marginLeft: 250,
                marginTop: 88,
                padding: theme.spacing.unit * 3,
                paddingLeft: theme.spacing.unit * 40,
                paddingRight: theme.spacing.unit * 40
            },
            backgroundColor: theme.palette.background.default,
            minHeight: isDarwinApp() ? "100vh" : "auto"
        },
        pageLayoutMinimalConstraints: {
            flexGrow: 1,
            [theme.breakpoints.up("md")]: {
                marginLeft: 250
            },
            backgroundColor: theme.palette.background.default,
            minHeight: isDarwinApp() ? "100vh" : "auto"
        },
        pageLayoutEmptyTextConstraints: {
            paddingLeft: theme.spacing.unit * 2,
            paddingRight: theme.spacing.unit * 2
        },
        pageMinimalBreak: {
            height: isAppbarExpanded() ? 80 : 56,
            [theme.breakpoints.up("md")]: {
                height: isAppbarExpanded() ? 88 : 64
            }
        },
        pageHeroBackground: {
            position: "relative",
            height: "intrinsic",
            backgroundColor: theme.palette.primary.dark,
            width: "100%",
            color: theme.palette.common.white,
            zIndex: 1,
            top: isAppbarExpanded() ? 80 : 56,
            [theme.breakpoints.up("md")]: {
                top: isAppbarExpanded() ? 88 : 64
            }
        },
        pageHeroBackgroundImage: {
            position: "absolute",
            bottom: 0,
            left: 0,
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            height: "100%",
            width: "100%",
            opacity: 0.35,
            zIndex: -1,
            filter: "blur(2px)"
        },
        pageHeroContent: {
            padding: 16,
            paddingTop: 8,
            width: "100%",
            height: "100%",
            [theme.breakpoints.up("md")]: {
                paddingLeft: "5%",
                paddingRight: "5%"
            },
            position: "relative",
            zIndex: 1
        },
        pageHeroToolbar: {
            position: "absolute",
            right: theme.spacing.unit * 2,
            marginTop: -16
        },
        pageListConstraints: {
            paddingLeft: theme.spacing.unit,
            paddingRight: theme.spacing.unit,
            [theme.breakpoints.up("sm")]: {
                paddingLeft: theme.spacing.unit * 2,
                paddingRight: theme.spacing.unit * 2
            }
            //backgroundColor: theme.palette.background.default
        },
        profileToolbar: {
            zIndex: 2,
            paddingTop: 8
        },
        profileContent: {
            padding: 16,
            [theme.breakpoints.up("md")]: {
                paddingLeft: "5%",
                paddingRight: "5%",
                paddingBottom: 48,
                paddingTop: 24
            },
            width: "100%",
            height: "100%",
            position: "relative",
            zIndex: 1,
            display: "flex",
            paddingBottom: 24,
            paddingTop: 24
        },
        profileAvatar: {
            width: 64,
            height: 64,
            [theme.breakpoints.up("md")]: {
                width: 128,
                height: 128
            },
            backgroundColor: theme.palette.primary.main
        },
        profileUserBox: {
            paddingLeft: theme.spacing.unit * 2
        },
        pageProfileAvatar: {
            width: 128,
            height: 128,
            marginLeft: "auto",
            marginRight: "auto",
            marginBottom: theme.spacing.unit,
            backgroundColor: theme.palette.primary.main
        },
        pageProfileNameEmoji: {
            minHeight: theme.typography.h4.fontSize,
            fontWeight: theme.typography.fontWeightMedium,
            "& img": {
                height: theme.typography.h4.fontSize
            }
        },
        pageProfileBioEmoji: {
            height: "0.875rem",
            "& img": {
                height: "0.875rem",
                paddingLeft: 4,
                paddingRight: 4
            }
        },
        pageProfileStatsDiv: {
            display: "inline-flex",
            marginTop: theme.spacing.unit * 2,
            marginBottom: theme.spacing.unit * 2
        },
        pageProfileStat: {
            marginLeft: theme.spacing.unit,
            marginRight: theme.spacing.unit
        },
        pageProfileFollowButton: {
            marginTop: theme.spacing.unit,
            marginLeft: theme.spacing.unit,
            marginRight: theme.spacing.unit,
            zIndex: 3
        },
        pageContentLayoutConstraints: {
            paddingLeft: theme.spacing.unit,
            paddingRight: theme.spacing.unit,
            paddingTop: theme.spacing.unit * 12,
            paddingBottom: theme.spacing.unit * 2,
            [theme.breakpoints.up("lg")]: {
                paddingLeft: theme.spacing.unit * 32,
                paddingRight: theme.spacing.unit * 32
            }
            //backgroundColor: theme.palette.background.default,
        },
        errorCard: {
            padding: theme.spacing.unit * 4,
            backgroundColor: theme.palette.error.main
        },
        pageTopChipContainer: {
            zIndex: 24,
            position: "fixed",
            width: "100%"
        },
        pageTopChips: {
            textAlign: "center",
            [theme.breakpoints.up("md")]: {
                marginRight: "55%"
            },
            [theme.breakpoints.up("xl")]: {
                marginRight: "50%"
            }
        },
        pageTopChip: {
            boxShadow: theme.shadows[10]
        },
        clearAllButton: {
            zIndex: 3,
            position: "absolute",
            right: 24,
            top: 100,
            [theme.breakpoints.up("md")]: {
                top: 116,
                right: theme.spacing.unit * 24
            }
        },
        mobileOnly: {
            [theme.breakpoints.up("sm")]: {
                display: "none"
            }
        },
        desktopOnly: {
            display: "none",
            [theme.breakpoints.up("sm")]: {
                display: "block"
            }
        },
        pageLayoutFooter: {
            "& a": {
                color: theme.palette.primary.light
            }
        },
        youHeadingAvatar: {
            height: 88,
            width: 88
        },
        youPaper: {
            padding: theme.spacing.unit * 2
        },
        youGrid: {
            textAlign: "center",
            "& *": {
                marginLeft: "auto",
                marginRight: "auto"
            }
        },
        youGridAvatar: {
            height: 128,
            width: 128
        },
        youGridImage: {
            width: "auto",
            height: 128
        },
        instanceHeaderPaper: {
            height: 150,
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            position: "relative",
            backgroundColor: theme.palette.primary.dark,
            borderTopLeftRadius: theme.shape.borderRadius,
            borderTopRightRadius: theme.shape.borderRadius
        },
        instanceHeaderText: {
            position: "absolute",
            bottom: theme.spacing.unit,
            left: theme.spacing.unit * 2,
            "& *": {
                color: theme.palette.common.white,
                textShadow: `0 0 4px ${theme.palette.grey[700]}`,
                fontWeight: 600
            }
        },
        instanceToolbar: {
            position: "absolute",
            top: theme.spacing.unit,
            right: theme.spacing.unit,
            color: theme.palette.common.white
        },
        pageGrow: {
            flexGrow: 1
        },
        settingsHeaderText: {
            fontSize: theme.typography.h6.fontSize,
            [theme.breakpoints.up("sm")]: {
                fontSize: theme.typography.h4.fontSize
            }
        },
        settingsDetailText: {
            fontSize: theme.typography.body2.fontSize,
            [theme.breakpoints.up("sm")]: {
                fontSize: theme.typography.h6.fontSize
            }
        },
        settingsAvatar: {
            width: 64,
            height: 64,
            display: "none",
            [theme.breakpoints.up("md")]: {
                width: 128,
                height: 128,
                display: "block"
            },
            backgroundColor: theme.palette.primary.main
        },
        pageLayoutMasonry: {
            paddingLeft: theme.spacing.unit * 3,
            paddingRight: theme.spacing.unit * 3
        },
        masonryGrid: {
            display: "flex",
            width: "auto"
        },
        "my-masonry-grid_column": {
            // non-standard name fixes react-masonry-css bug :shrug:
            padding: 5
        },
        noTopPaddingMargin: {
            marginTop: 0,
            paddingTop: 0
        }
    });
