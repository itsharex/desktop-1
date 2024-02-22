import { List } from "antd";
import React from "react";
import s from "./TagListPanel.module.less";
import { useStores } from "@/hooks";
import { useHistory, useLocation } from "react-router-dom";
import { observer } from 'mobx-react';
import type { LinkIdeaPageState } from "@/stores/linkAux";
import { LinkIdeaPageInfo } from "@/stores/linkAux";




const TagListPanel= () => {
    const history = useHistory();
    const location = useLocation();

    let state: LinkIdeaPageState | undefined = location.state as LinkIdeaPageState | undefined;
    if (state == undefined) {
        state = {
            keywordList: [],
            tagId: "",
            ideaId: "",
        }
    }

    const projectStore = useStores('projectStore');
    const linkAuxStore = useStores('linkAuxStore');

    return (
        <div>
            <List className={s.tag_list} >
                <List.Item className={state?.tagId == "" ? s.cur_tag : ""} style={{ padding: "0px 0px" }}>
                    <div className={s.tag}
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (state?.tagId != "") {
                                linkAuxStore.goToLink(new LinkIdeaPageInfo("", projectStore.curProjectId, "", state?.keywordList ?? []), history);
                            }
                        }}
                    >全部知识点</div>
                </List.Item>
            </List>
        </div>
    );
}

export default observer(TagListPanel);