import { Button, Card, List, Modal } from "antd";
import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { useStores } from "@/hooks";
import type { Idea, APPRAISE_TYPE } from "@/api/project_idea";
import { APPRAISE_AGREE, APPRAISE_DIS_AGREE, IDEA_SORT_APPRAISE, KEYWORD_SEARCH_OR, cancel_appraise, list_idea, set_appraise, get_idea } from "@/api/project_idea";
import { request } from "@/utils/request";
import { ReadOnlyEditor } from "@/components/Editor";
import { DislikeFilled, DislikeOutlined, LikeFilled, LikeOutlined } from "@ant-design/icons";
import s from "./IdeaTipModal.module.less";
import { LinkIdeaPageInfo } from "@/stores/linkAux";
import { useHistory } from "react-router-dom";

const PAGE_SIZE = 10;

const IdeaTipModal = () => {
    const history = useHistory();

    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const linkAuxStore = useStores('linkAuxStore');

    const [ideaList, setIdeaList] = useState([] as Idea[]);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);

    const loadIdeaList = async () => {
        const res = await request(list_idea({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            list_param: {
                filter_by_tag: false,
                tag_id_list: [],
                filter_by_keyword: true,
                keyword_list: [projectStore.projectModal.ideaKeyword],
                keyword_search_type: KEYWORD_SEARCH_OR,
            },
            sort_type: IDEA_SORT_APPRAISE,
            offset: curPage * PAGE_SIZE,
            limit: PAGE_SIZE,
        }));
        setTotalCount(res.total_count);
        setIdeaList(res.idea_list);
    };

    const onUpdate = async (ideaId: string) => {
        const res = await request(get_idea({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            idea_id: ideaId,
        }));

        const tmpList = ideaList.slice();
        const index = tmpList.findIndex(item => item.idea_id == ideaId);
        if (index != -1) {
            tmpList[index] = res.idea;
            setIdeaList(tmpList);
        }
    };

    const setAgree = async (ideaId: string, appraiseType: APPRAISE_TYPE) => {
        await request(set_appraise({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            idea_id: ideaId,
            appraise_type: appraiseType,
        }));
        onUpdate(ideaId);
    };

    const cancelAgree = async (ideaId: string) => {
        await request(cancel_appraise({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            idea_id: ideaId,
        }));
        onUpdate(ideaId);
    };

    useEffect(() => {
        loadIdeaList();
    }, [curPage]);

    return (
        <Modal open title={`知识点 ${projectStore.projectModal.ideaKeyword}`}
            bodyStyle={{ height: "calc(100vh - 300px)", overflowY: "scroll" }}
            cancelText="关闭" okText="前往知识点仓库"
            width={700}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                projectStore.projectModal.ideaKeyword = "";
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                linkAuxStore.goToLink(new LinkIdeaPageInfo("", projectStore.curProjectId, "", [projectStore.projectModal.ideaKeyword]), history);
                projectStore.projectModal.ideaKeyword = "";
            }}>
            <List rowKey="idea_id" dataSource={ideaList} pagination={{ current: curPage + 1, total: totalCount, pageSize: PAGE_SIZE, onChange: page => setCurPage(page - 1), hideOnSinglePage: true }}
                renderItem={item => (
                    <List.Item>
                        <Card title={<span style={{ fontSize: "16px", fontWeight: 600 }}>{item.basic_info.title}</span>} bordered={false} style={{ width: "100%" }}
                            extra={
                                <div className={s.agree_wrap}>
                                    <div>
                                        {!(item.has_my_appraise && item.my_appraise_type == APPRAISE_AGREE) && (
                                            <Button type="text" style={{ minWidth: 0, padding: "0px 0px" }} disabled={!item.user_perm.can_appraise}
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    setAgree(item.idea_id, APPRAISE_AGREE);
                                                }}><span className={s.icon}><LikeOutlined />&nbsp;{item.agree_count}</span></Button>
                                        )}
                                        {item.has_my_appraise && item.my_appraise_type == APPRAISE_AGREE && (
                                            <Button type="text" style={{ minWidth: 0, padding: "0px 0px" }} disabled={!item.user_perm.can_appraise}
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    cancelAgree(item.idea_id);
                                                }}><span className={s.icon}><LikeFilled />&nbsp;{item.agree_count}</span></Button>
                                        )}
                                    </div>
                                    <div>
                                        {!(item.has_my_appraise && item.my_appraise_type == APPRAISE_DIS_AGREE) && (
                                            <Button type="text" style={{ minWidth: 0, padding: "0px 0px" }} disabled={!item.user_perm.can_appraise}
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    setAgree(item.idea_id, APPRAISE_DIS_AGREE);
                                                }}><span className={s.icon}><DislikeOutlined />&nbsp;{item.disagree_count}</span></Button>
                                        )}
                                        {item.has_my_appraise && item.my_appraise_type == APPRAISE_DIS_AGREE && (
                                            <Button type="text" style={{ minWidth: 0, padding: "0px 0px" }} disabled={!item.user_perm.can_appraise}
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    cancelAgree(item.idea_id);
                                                }}><span className={s.icon}><DislikeFilled />&nbsp;{item.disagree_count}</span></Button>
                                        )}

                                    </div>
                                </div>
                            }>
                            <ReadOnlyEditor content={item.basic_info.content} />
                        </Card>
                    </List.Item>
                )} />
        </Modal>
    )
};

export default observer(IdeaTipModal);