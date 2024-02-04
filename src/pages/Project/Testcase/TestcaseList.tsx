import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import CardWrap from "@/components/CardWrap";
import { Breadcrumb, Checkbox, Form, Input, Space, Tabs } from "antd";
import Button from "@/components/Button";
import { PlusOutlined } from "@ant-design/icons";
import FolderModeContent from "./FolderModeContent";
import { useStores } from "@/hooks";
import type { FolderPathItem } from "@/api/project_testcase";
import { get_folder_path } from "@/api/project_testcase";
import { request } from "@/utils/request";
import ListModeContent from "./ListModeContent";


const TestcaseList = () => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const appStore = useStores('appStore');

    const [activeKey, setActiveKey] = useState<"folder" | "list">("folder");
    const [curFolderId, setCurFolderId] = useState(""); //只对目录模式有效

    const [pathList, setPathList] = useState<FolderPathItem[]>([]);

    const [filterTitle, setFilterTitle] = useState("");
    const [filterMyWatch, setFilterMyWatch] = useState(false);

    const calcFolderInfoWidth = () => {
        let subWidth = 260;
        if (appStore.focusMode == false) {
            subWidth += 200;
        }
        if (projectStore.showChatAndComment) {
            subWidth += 300;
        }
        return `calc(100vw - ${subWidth}px)`;
    };

    const loadPathList = async () => {
        if (curFolderId == "") {
            setPathList([]);
            return;
        }
        const res = await request(get_folder_path({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            folder_id: curFolderId,
        }));
        setPathList(res.path_list);
    };

    useEffect(() => {
        loadPathList();
    }, [curFolderId]);

    return (
        <CardWrap title="测试用例" extra={
            <Space size="middle">
                <Button icon={<PlusOutlined />} onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    projectStore.projectModal.setCreateTestCase(true, activeKey == "folder" ? curFolderId : "", activeKey == "folder");
                }}>
                    创建{activeKey == "folder" ? "目录/测试用例" : "测试用例"}
                </Button>
            </Space>
        }>
            <Tabs activeKey={activeKey} onChange={key => {
                if (key == "folder") {
                    setActiveKey(key);
                } else if (key == "list") {
                    setActiveKey(key);
                    setCurFolderId("");
                }
            }}
                type="card"
                style={{ padding: "0px 10px" }}
                tabBarStyle={{ height: "40px" }}
                items={[
                    {
                        key: "folder",
                        label: <span style={{ fontSize: "16px", fontWeight: 600 }}>目录</span>,
                        children: (
                            <div style={{ height: "calc(100vh - 210px)", overflowY: "scroll", paddingRight: "20px", paddingBottom: "20px" }}>
                                {activeKey == "folder" && (
                                    <FolderModeContent curFolderId={curFolderId} onChangeFolder={folderId => setCurFolderId(folderId)} />
                                )}
                            </div>
                        ),
                    },
                    {
                        key: "list",
                        label: <span style={{ fontSize: "16px", fontWeight: 600 }}>列表</span>,
                        children: (
                            <div style={{ height: "calc(100vh - 210px)", overflowY: "scroll", paddingRight: "20px" }}>
                                {activeKey == "list" && (
                                    <ListModeContent filterTitle={filterTitle} filterMyWatch={filterMyWatch} />
                                )}
                            </div>
                        ),
                    }
                ]} tabBarExtraContent={
                    <>
                        {activeKey == "folder" && (
                            <div style={{ width: calcFolderInfoWidth(), overflow: "hidden", height: "30px" }}>
                                <Breadcrumb>
                                    <Breadcrumb.Item>
                                        <Button type="link" disabled={curFolderId == ""}
                                            style={{ minWidth: 0, padding: "0px 0px" }}
                                            onClick={e => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                setCurFolderId("");
                                            }}>
                                            根目录
                                        </Button>
                                    </Breadcrumb.Item>
                                    {pathList.map(item => (
                                        <Breadcrumb.Item key={item.folder_id}>
                                            <Button type="link" disabled={item.folder_id == curFolderId}
                                                style={{ minWidth: 0, padding: "0px 0px" }}
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    setCurFolderId(item.folder_id);
                                                }}>{item.title}</Button>
                                        </Breadcrumb.Item>
                                    ))}
                                </Breadcrumb>
                            </div>
                        )}
                        {activeKey == "list" && (
                            <Form layout="inline">
                                <Form.Item label="只看我的关注">
                                    <Checkbox checked={filterMyWatch} onChange={e => {
                                        e.stopPropagation();
                                        setFilterMyWatch(e.target.checked);
                                    }} />
                                </Form.Item>
                                <Form.Item label="过滤标题">
                                    <Input value={filterTitle} style={{ width: "200px" }} size="small" placeholder="请输入关键词..."
                                        onChange={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setFilterTitle(e.target.value.trim());
                                        }} allowClear />
                                </Form.Item>
                            </Form>
                        )}
                    </>
                } />
        </CardWrap>
    );
};

export default observer(TestcaseList);