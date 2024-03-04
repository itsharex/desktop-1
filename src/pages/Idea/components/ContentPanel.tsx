import { Card, Form, Input, List, Select } from "antd";
import React, { useEffect, useState } from "react";
import { observer, useLocalObservable } from 'mobx-react';
import { useHistory } from "react-router-dom";
import s from "./ContentPanel.module.less";
import type { Idea, IdeaGroup, KEYWORD_SEARCH_TYPE } from "@/api/project_idea";
import { get_idea, list_idea, IDEA_SORT_APPRAISE, IDEA_SORT_UPDATE_TIME, KEYWORD_SEARCH_AND, KEYWORD_SEARCH_OR } from "@/api/project_idea";
import { request } from "@/utils/request";
import { useStores } from "@/hooks";
import IdeaContent from "./IdeaContent";
import { runInAction } from "mobx";
import { LinkIdeaPageInfo } from "@/stores/linkAux";
import Button from "@/components/Button";
import { listen } from '@tauri-apps/api/event';
import type * as NoticeType from '@/api/notice_type';

const PAGE_SIZE = 10;

export interface ContentPanelProps {
    groupList: IdeaGroup[];
}

const ContentPanel = (props: ContentPanelProps) => {
    const history = useHistory();

    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const ideaStore = useStores('ideaStore');
    const linkAuxStore = useStores('linkAuxStore');
    const appStore = useStores('appStore');

    const [keywordSearchType, setKeywordSearchType] = useState<KEYWORD_SEARCH_TYPE>(KEYWORD_SEARCH_AND);
    const [titleKeyword, setTitleKeyword] = useState("");

    const localStore = useLocalObservable(() => ({
        ideaList: [] as Idea[],
        setIdeaList(value: Idea[]) {
            runInAction(() => {
                this.ideaList = value;
            });
        }
    }));
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);

    const updateIdea = async (ideaId: string) => {
        const res = await request(get_idea({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            idea_id: ideaId,
        }));
        const index = localStore.ideaList.findIndex(item => item.idea_id == ideaId);
        if (index != -1) {
            const tmpList = localStore.ideaList.slice();
            tmpList[index] = res.idea;
            localStore.setIdeaList(tmpList);
        }
    };

    const loadIdeaList = async () => {
        const res = await request(list_idea({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            list_param: {
                filter_by_keyword: ideaStore.searchKeywords.length > 0,
                keyword_list: ideaStore.searchKeywords,
                keyword_search_type: keywordSearchType,
                filter_by_group_or_store_id: ideaStore.curIdeaGroupId != "",
                group_or_store_id: ideaStore.curIdeaGroupId,
                filter_by_title_keyword: titleKeyword != "",
                title_keyword: titleKeyword,
            },
            sort_type: ideaStore.searchKeywords.length > 0 ? IDEA_SORT_APPRAISE : IDEA_SORT_UPDATE_TIME,
            offset: PAGE_SIZE * curPage,
            limit: PAGE_SIZE,
        }));
        setTotalCount(res.total_count);
        localStore.setIdeaList(res.idea_list);
    };

    const loadIdea = async () => {
        const res = await request(get_idea({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            idea_id: ideaStore.curIdeaId,
        }));
        localStore.setIdeaList([res.idea]);
    };

    useEffect(() => {
        if (ideaStore.curIdeaId != "") {
            loadIdea();
        } else {
            loadIdeaList();
        }
    }, [curPage]);

    useEffect(() => {
        if (curPage != 0) {
            setCurPage(0);
        } else {
            if (ideaStore.curIdeaId != "") {
                loadIdea();
            } else {
                loadIdeaList();
            }
        }
    }, [ideaStore.searchKeywords, ideaStore.curIdeaGroupId, ideaStore.curIdeaId, keywordSearchType, titleKeyword]);

    useEffect(() => {
        const unListenFn = listen<NoticeType.AllNotice>("notice", ev => {
            const notice = ev.payload;
            if (notice.IdeaNotice?.MoveIdeaNotice != undefined && notice.IdeaNotice.MoveIdeaNotice.project_id == projectStore.curProjectId) {
                if (ideaStore.curIdeaId != "") {
                    loadIdea();
                } else {
                    loadIdeaList();
                }
            } else if (notice.IdeaNotice?.CreateIdeaNotice != undefined && notice.IdeaNotice.CreateIdeaNotice.project_id == projectStore.curProjectId) {
                let hasChange = false;
                if (ideaStore.searchKeywords.length > 0) {
                    ideaStore.searchKeywords = [];
                    hasChange = true;
                }
                setCurPage(oldValue => {
                    if (oldValue != 0) {
                        hasChange = true;
                    }
                    return 0;
                });
                if (hasChange == false) {
                    if (ideaStore.curIdeaId != "") {
                        loadIdea();
                    } else {
                        loadIdeaList();
                    }
                }
            } else if (notice.IdeaNotice?.UpdateIdeaNotice != undefined && notice.IdeaNotice.UpdateIdeaNotice.project_id == projectStore.curProjectId) {
                updateIdea(notice.IdeaNotice.UpdateIdeaNotice.idea_id);
            } else if (notice.IdeaNotice?.RemoveIdeaNotice != undefined && notice.IdeaNotice.RemoveIdeaNotice.project_id == projectStore.curProjectId) {
                if (ideaStore.curIdeaId != "") {
                    loadIdea();
                } else {
                    loadIdeaList();
                }
            } else if (notice.IdeaNotice?.ClearGroupNotice != undefined && notice.IdeaNotice.ClearGroupNotice.project_id == projectStore.curProjectId && notice.IdeaNotice.ClearGroupNotice.idea_group_id == ideaStore.curIdeaGroupId) {
                setTotalCount(0);
                localStore.setIdeaList([]);
            }
        });
        return () => {
            unListenFn.then((unListen) => unListen());
        };
    }, [])

    return (
        <Card bordered={false} extra={
            <>
                {ideaStore.curIdeaId == "" && (
                    <Form layout="inline">
                        <Form.Item label="过滤标题">
                            <Input value={titleKeyword} onChange={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setTitleKeyword(e.target.value.trim());
                            }} />
                        </Form.Item>
                        <Form.Item label="关键词模式">
                            <Select value={keywordSearchType} style={{ width: "120px" }} onChange={value => setKeywordSearchType(value as KEYWORD_SEARCH_TYPE)}>
                                <Select.Option value={KEYWORD_SEARCH_AND}>匹配所有关键词</Select.Option>
                                <Select.Option value={KEYWORD_SEARCH_OR}>匹配任一关键词</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label="关键词">
                            <Select value={ideaStore.searchKeywords} onChange={value => ideaStore.searchKeywords = (value as string[])} mode="multiple"
                                style={{ minWidth: "300px" }}>
                                {ideaStore.keywordList.map(item => (
                                    <Select.Option key={item} value={item}>{item}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Form>
                )}
                {ideaStore.curIdeaId != "" && (
                    <Button type="link" onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        linkAuxStore.goToLink(new LinkIdeaPageInfo("", projectStore.curProjectId, "", ideaStore.searchKeywords), history);
                    }}>正在查看单个知识点，查看全部知识点</Button>
                )}
            </>
        } style={{ width: appStore.focusMode == true ? "calc(100vw - 300px)" : "calc(100vw - 500px)" }}>
            <div className={s.content_list}>
                <List dataSource={localStore.ideaList} split={false} renderItem={item => (
                    <List.Item key={item.idea_id}>
                        <IdeaContent idea={item} groupList={props.groupList} />
                    </List.Item>
                )} pagination={{
                    total: totalCount,
                    pageSize: PAGE_SIZE,
                    current: curPage + 1,
                    onChange: page => setCurPage(page - 1),
                }} />
            </div>
        </Card>
    );
};

export default observer(ContentPanel);