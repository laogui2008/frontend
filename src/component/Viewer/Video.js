import React, { useCallback, useEffect, useState } from "react";
import DPlayer from "react-dplayer";
import { Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useLocation, useParams, useRouteMatch } from "react-router";
import API, { getBaseURL } from "../../middleware/Api";
import { useDispatch } from "react-redux";
import { changeSubTitle } from "../../redux/viewUpdate/action";
import pathHelper from "../../utils/page";
import { toggleSnackbar } from "../../actions";
import TextLoading from "../Placeholder/TextLoading";

const useStyles = makeStyles(theme => ({
    layout: {
        width: "auto",
        marginTop: "30px",
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        [theme.breakpoints.up(1100 + theme.spacing(3) * 2)]: {
            width: 1100,
            marginLeft: "auto",
            marginRight: "auto"
        },
        marginBottom: 50
    },
    player: {
        borderRadius: "4px",
        maxHeight:600,
    }
}));

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function VideoViewer() {
    const math = useRouteMatch();
    const location = useLocation();
    const query = useQuery();
    const { id } = useParams();
    const dispatch = useDispatch();
    const SetSubTitle = useCallback(title => dispatch(changeSubTitle(title)), [
        dispatch
    ]);
    const [subTitleUrl, setSubTitleUrl] = useState("-1");
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    useEffect(() => {
        if (!pathHelper.isSharePage(location.pathname)) {
            const path = query.get("p").split("/");
            SetSubTitle(path[path.length - 1]);
        } else {
            SetSubTitle(query.get("name"));
        }
        // eslint-disable-next-line
    }, [math.params[0], location]);

    useEffect(() => {
        const subTitleId = query.get("subTitleId");
        if (subTitleId != "") {
            API.put("/file/download/" + subTitleId)
                .then(response => {
                    const subtitleUrl = response.data;
                    if (subtitleUrl != "") {
                        setSubTitleUrl(subtitleUrl);
                    } else {
                        setSubTitleUrl("1");
                    }
                })
                .catch(error => {
                    setSubTitleUrl("1");
                    ToggleSnackbar(
                        "top",
                        "right",
                        "无法加载字幕",
                        "error"
                    );
                })
        } else {
            setSubTitleUrl("1");
        }
    }, [query.get("id")]);

    const sUserAgent = navigator.userAgent.toLowerCase();
    let subTitleFontSize = "28px"
    if(/ipad|iphone|midp|rv:1.2.3.4|ucweb|android|windows ce|windows mobile/.test(sUserAgent)){
        subTitleFontSize = "12px"
    }

    const classes = useStyles();
    return (
        <div className={classes.layout}>
            {subTitleUrl == "-1" && <TextLoading />}
            {subTitleUrl == "1" && <Paper className={classes.root} elevation={1}>
                <DPlayer
                    className={classes.player}
                    options={{
                        video: {
                            url:
                                getBaseURL() +
                                (pathHelper.isSharePage(location.pathname)
                                    ? "/share/preview/" +
                                    id +
                                    (query.get("share_path") !== ""
                                        ? "?path=" +
                                        encodeURIComponent(
                                            query.get("share_path")
                                        )
                                        : "")
                                    : "/file/preview/" + query.get("id"))
                        }
                    }}
                />
            </Paper>}
            {subTitleUrl.length > 3 && <Paper className={classes.root} elevation={1}>
                <DPlayer
                    className={classes.player}
                    options={{
                        video: {
                            url:
                                getBaseURL() +
                                (pathHelper.isSharePage(location.pathname)
                                    ? "/share/preview/" +
                                    id +
                                    (query.get("share_path") !== ""
                                        ? "?path=" +
                                        encodeURIComponent(
                                            query.get("share_path")
                                        )
                                        : "")
                                    : "/file/preview/" + query.get("id"))
                        },
                        subtitle: {
                            url: subTitleUrl,
                            type: "webvtt",
                            fontSize: subTitleFontSize,
                            bottom: "1%"
                        }
                    }}
                />
            </Paper>}
        </div>
    );
}
