import { Button, Card, List, Modal, Popover, Space, message } from "antd";
import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import type { IdeaInStore } from "@/api/idea_store";
import { list_idea_by_id } from "@/api/idea_store";
import { list_idea as list_user_idea, save_idea_list } from "@/api/user_idea";
import { useStores } from "@/hooks";
import { request } from "@/utils/request";
import { ReadOnlyEditor } from "@/components/Editor";
import { MoreOutlined } from "@ant-design/icons";

const PAGE_SIZE = 12;

export interface IdeaListProps {
    ideaVersion: number;
}

const IdeaList = (props: IdeaListProps) => {
    const userStore = useStores('userStore');

    const [ideaIdList, setIdeaIdList] = useState([] as string[]);
    const [ideaList, setIdeaList] = useState([] as IdeaInStore[]);
    const [curPage, setCurPage] = useState(0);

    const [removeIdeaInfo, setRemoveIdeaInfo] = useState<null | IdeaInStore>(null);

    const loadIdeaIdList = async () => {
        const userId = userStore.userInfo.userId == "" ? "all" : userStore.userInfo.userId;
        const res = await list_user_idea(userId);
        setIdeaIdList(res);
    };

    const loadIdeaList = async () => {
        const start = curPage * PAGE_SIZE;
        const res = await request(list_idea_by_id({
            idea_id_list: ideaIdList.slice(start, start + PAGE_SIZE),
        }));
        setIdeaList(res.idea_list);
    };

    const setTop = async (ideaId: string) => {
        const userId = userStore.userInfo.userId == "" ? "all" : userStore.userInfo.userId;
        const tmpList = ideaIdList.filter(item => item != ideaId);
        tmpList.unshift(ideaId);
        await save_idea_list(userId, tmpList);
        setIdeaIdList(tmpList);
        setCurPage(0);
        message.info("置顶成功");
    };

    const removeIdea = async () => {
        if (removeIdeaInfo == null) {
            return;
        }
        const userId = userStore.userInfo.userId == "" ? "all" : userStore.userInfo.userId;
        const tmpList = ideaIdList.filter(item => item != removeIdeaInfo.idea_id);
        await save_idea_list(userId, tmpList);
        setIdeaIdList(tmpList);
        setCurPage(0);
        setRemoveIdeaInfo(null);
        message.info("删除成功");
    };

    useEffect(() => {
        setCurPage(0);
        loadIdeaIdList();
    }, [props.ideaVersion]);

    useEffect(() => {
        if (ideaIdList.length == 0) {
            setIdeaList([]);
        } else {
            loadIdeaList();
        }
    }, [curPage, ideaIdList]);

    return (
        <>
            <List rowKey="idea_id" dataSource={ideaList} grid={{ gutter: 16 }}
                pagination={{ current: curPage + 1, pageSize: PAGE_SIZE, total: ideaIdList.length, onChange: page => setCurPage(page - 1), showSizeChanger: false, hideOnSinglePage: true }}
                renderItem={idea => (
                    <List.Item>
                        <Card title={idea.basic_info.title} style={{ width: "400px" }} headStyle={{ backgroundColor: "#eee" }}
                            extra={
                                <Popover trigger="click" placement="bottom" content={
                                    <Space direction="vertical" size="small" style={{ padding: "10px 10px" }}>
                                        <Button type="link" onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setTop(idea.idea_id);
                                        }}>置顶</Button>
                                        <Button type="link" danger
                                            onClick={e => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                setRemoveIdeaInfo(idea);
                                            }}>删除</Button>
                                    </Space>
                                }>
                                    <MoreOutlined />
                                </Popover>
                            }>
                            <div className="_projectEditContext">
                                <ReadOnlyEditor content={idea.basic_info.content} />
                            </div>
                        </Card>
                    </List.Item>
                )} />
            {removeIdeaInfo != null && (
                <Modal open title="删除知识点"
                    okText="删除"
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setRemoveIdeaInfo(null);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeIdea();
                    }}>
                    是否删除知识点&nbsp;{removeIdeaInfo.basic_info.title}&nbsp;?
                </Modal>
            )}
        </>
    );
};

export default observer(IdeaList);