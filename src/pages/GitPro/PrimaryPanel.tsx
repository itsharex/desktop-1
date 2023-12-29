import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { Button, Card, Menu, message } from "antd";
import { useGitProStores } from "./stores";
import { get_git_info } from "@/api/local_repo";
import type { ItemType } from "antd/lib/menu/hooks/useItems";
import { ReloadOutlined } from "@ant-design/icons";


const PrimaryPanel = () => {
    const gitProStore = useGitProStores();

    const [infoItemList, setInfoItemList] = useState<ItemType[]>([]);
    const [activeKey, setActiveKey] = useState("head");

    const initInfoTreeData = async () => {
        if (gitProStore.repoInfo == null) {
            return;
        }
        setActiveKey("head");
        const gitInfo = await get_git_info(gitProStore.repoInfo.path);

        gitProStore.commitIdForGraph = gitInfo.head.commit_id;

        const headItemData: ItemType = {
            label: `HEAD(${gitInfo.head.branch_name})`,
            key: "head",
            onClick: () => {
                gitProStore.commitIdForGraph = gitInfo.head.commit_id;
                gitProStore.curCommit = null;
                gitProStore.curDiffFile = null;
            },
        };

        const branchItemData: ItemType = {
            label: "分支",
            key: "branch",
            children: gitInfo.branch_list.map(item => ({
                label: item.name,
                key: `branch:${item.name}`,
                style: { backgroundColor: "white" },
                onClick: () => {
                    gitProStore.commitIdForGraph = item.commit_id;
                    gitProStore.curCommit = null;
                    gitProStore.curDiffFile = null;
                },
            })),
        };

        const tagItemData: ItemType = {
            label: "标记",
            key: "tag",
            children: gitInfo.tag_list.map(item => ({
                label: item.name,
                key: `tag:${item.name}`,
                style: { backgroundColor: "white" },
                onClick: () => {
                    console.log(item);
                    gitProStore.commitIdForGraph = item.commit_id;
                    gitProStore.curCommit = null;
                    gitProStore.curDiffFile = null;
                },
            }))
        };

        const remoteItemData: ItemType = {
            label: "远程仓库",
            key: "remote",
            children: gitInfo.remote_list.map(item => ({
                label: <span title={`${item.url}`}>{item.name}</span>,
                key: `remote:${item.name}`,
            })),
        };

        const treeData: ItemType[] = [
            headItemData,
            branchItemData,
            tagItemData,
            remoteItemData,
        ];
        setInfoItemList(treeData);
    };

    useEffect(() => {
        initInfoTreeData();
    }, [gitProStore.repoInfo]);

    return (
        <div>
            <Card title="仓库信息" bodyStyle={{ overflowY: "scroll", height: "calc(100vh - 40px)" }} extra={
                <Button type="link" icon={<ReloadOutlined />} title="刷新仓库信息" onClick={e=>{
                    e.stopPropagation();
                    e.preventDefault();
                    initInfoTreeData().then(()=>message.info("已刷新仓库信息"));
                }}/>
            }>
                <Menu items={infoItemList} mode="inline" defaultOpenKeys={["branch", "remote"]} selectedKeys={[activeKey]}
                    onSelect={(info) => {
                        if (!(info.key == "remote" || info.key.startsWith("remote:"))) {
                            setActiveKey(info.key);
                        }
                    }} />
            </Card>
        </div>
    );
};

export default observer(PrimaryPanel);