//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { Button, Card, Dropdown, Form, List, Select, Space, Tabs } from "antd";
import type { GitVpSourceInfo, GitVpInfo } from "@/api/git_vp";
import { list_git_vp, list_git_vp_source, VP_SORT_BY_FORK_COUNT, VP_SORT_BY_STAR_COUNT, VP_SORT_BY_TIMESTAMP } from "@/api/git_vp";
import { request } from "@/utils/request";
import { open as shell_open } from '@tauri-apps/api/shell';
import AsyncImage from "@/components/AsyncImage";
import { BranchesOutlined, DownOutlined, ForkOutlined, StarOutlined, TagOutlined } from "@ant-design/icons";
import defaultIcon from '@/assets/allIcon/app-default-icon.png';
import { observer } from "mobx-react";
import { useStores } from "@/hooks";
import AddRepoModal from "@/pages/Workbench/components/AddRepoModal";
import { useHistory } from "react-router-dom";
import { WORKBENCH_PATH } from "@/utils/constant";

const PAGE_SIZE = 12;

interface GitVpListProps {
    sourceId: string;
}

const GitVpList = observer((props: GitVpListProps) => {
    const history = useHistory();

    const localRepoStore = useStores("localRepoStore");


    const [sortBy, setSortBy] = useState(VP_SORT_BY_TIMESTAMP);
    const [repoList, setRepoList] = useState<GitVpInfo[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);
    const [cloneUrl, setCloneUrl] = useState("");
    const [cloneRepo, setCloneRepo] = useState<GitVpInfo | null>(null);

    const loadRepoList = async () => {
        const res = await request(list_git_vp({
            git_vp_source_id: props.sourceId,
            sort_by: sortBy,
            offset: PAGE_SIZE * curPage,
            limit: PAGE_SIZE,
        }));
        setRepoList(res.vp_list);
        setTotalCount(res.total_count);
    };

    const checkLocalRepo = (httpUrl: string, sshUrl: string): boolean => {
        for (const localRepo of localRepoStore.repoExtList) {
            for (const remoteInfo of localRepo.remoteList) {
                if (remoteInfo.url == httpUrl || remoteInfo.url == sshUrl) {
                    return true;
                }
            }
        }
        return false;
    };

    const getEnName = (webUrl: string) => {
        const url = new URL(webUrl);
        return url.pathname;
    };

    useEffect(() => {
        loadRepoList();
    }, [sortBy, props.sourceId, curPage]);

    useEffect(() => {
        localRepoStore.checkGitEnv();
    }, []);

    useEffect(() => {
        if (localRepoStore.checkResult?.hasGit == true) {
            localRepoStore.loadRepoList();
        }
    }, [localRepoStore.checkResult?.hasGit]);

    return (
        <Card
            bodyStyle={{ height: "calc(100vh - 180px)", overflowX: "hidden", overflowY: "scroll" }}
            bordered={false}
            extra={
                <Form layout="inline">
                    <Form.Item label="排序">
                        <Select style={{ width: "100px" }} value={sortBy} onChange={value => {
                            setSortBy(value);
                            setCurPage(0);
                        }}>
                            <Select.Option value={VP_SORT_BY_TIMESTAMP}>
                                按时间排序
                            </Select.Option>
                            <Select.Option value={VP_SORT_BY_STAR_COUNT}>
                                按Star排序
                            </Select.Option>
                            <Select.Option value={VP_SORT_BY_FORK_COUNT}>
                                按Fork排序
                            </Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            }>
            <List rowKey="web_url" dataSource={repoList} grid={{ gutter: 16 }}
                pagination={{ current: curPage + 1, pageSize: PAGE_SIZE, total: totalCount, onChange: page => setCurPage(page - 1), hideOnSinglePage: true, showSizeChanger: false }}
                renderItem={repo => (
                    <List.Item>
                        <Card title={
                            <a onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                shell_open(repo.web_url);
                            }}>{repo.name}</a>
                        } bodyStyle={{ width: "500px", height: "250px" }}
                            extra={
                                <Space>
                                    {repo.not_repo == false && localRepoStore.checkResult?.hasGit == true && (
                                        <>
                                            {checkLocalRepo(repo.git_http_url, repo.git_ssh_url) == true && (
                                                <Button type="primary" onClick={e => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    for (const localRepo of localRepoStore.repoExtList) {
                                                        for (const remoteInfo of localRepo.remoteList) {
                                                            if (remoteInfo.url == repo.git_http_url || remoteInfo.url == repo.git_ssh_url) {
                                                                history.push(`${WORKBENCH_PATH}?tab=localRepo&repoId=${localRepo.id}`);
                                                                return;
                                                            }
                                                        }
                                                    }
                                                }}>查看本地仓库</Button>
                                            )}
                                            {checkLocalRepo(repo.git_http_url, repo.git_ssh_url) == false && (
                                                <Dropdown menu={{
                                                    items: [
                                                        {
                                                            key: "ssh",
                                                            label: "SSH",
                                                            onClick: () => {
                                                                setCloneUrl(repo.git_ssh_url ?? "");
                                                                setCloneRepo(repo);
                                                            },
                                                        },
                                                        {
                                                            key: "https",
                                                            label: "HTTPS",
                                                            onClick: () => {
                                                                setCloneUrl(repo.git_http_url ?? "");
                                                                setCloneRepo(repo);
                                                            },
                                                        },
                                                    ],
                                                }} trigger={["click"]} >
                                                    <Space>
                                                        <a style={{ color: "orange", fontWeight: 500 }}>
                                                            克隆到本地
                                                            <DownOutlined />
                                                        </a>
                                                    </Space>
                                                </Dropdown>
                                            )}
                                        </>
                                    )}
                                </Space>
                            }>
                            <div style={{ display: "flex" }}>
                                <div style={{ width: "110px" }}>
                                    <AsyncImage width={90} height={90} src={repo.logo_url} preview={false} useRawImg={true} fallback={defaultIcon} />
                                    {repo.not_repo == false && (
                                        <div style={{ marginLeft: "10px", fontSize: "16px" }}>
                                            <div><StarOutlined />&nbsp;{repo.star_count}</div>
                                            <div><ForkOutlined />&nbsp;{repo.fork_count}</div>
                                            <div><BranchesOutlined />&nbsp;{repo.branch_count}</div>
                                            <div><TagOutlined />&nbsp;{repo.tag_count}</div>
                                        </div>
                                    )}

                                </div>
                                <div style={{ padding: "10px 10px", overflowY: "scroll", height: "240px" }}>
                                    <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                                        {repo.desc}
                                    </pre>
                                </div>
                            </div>
                        </Card>
                    </List.Item>
                )} />

            {cloneUrl != "" && cloneRepo != null && (
                <AddRepoModal name={cloneRepo.name} enName={getEnName(cloneRepo.web_url)} remoteUrl={cloneUrl}
                    onCancel={() => {
                        setCloneUrl("");
                        setCloneRepo(null);
                    }}
                    onOk={() => {
                        localRepoStore.loadRepoList().then(() => {
                            localRepoStore.loadRepoList();
                            setCloneUrl("");
                            setCloneRepo(null);
                        });
                    }} />
            )}
        </Card>
    );
});

const GitVpListPanel = () => {
    const [vpSourceList, setVpSourceList] = useState<GitVpSourceInfo[]>([]);
    const [activeKey, setActiveKey] = useState("");


    useEffect(() => {
        request(list_git_vp_source({})).then(res => {
            setVpSourceList(res.vp_source_list);
            if (res.vp_source_list.length > 0 && res.vp_source_list.map(item => item.git_vp_source_id).includes(activeKey) == false) {
                setActiveKey(res.vp_source_list[0].git_vp_source_id);
            }
        });
    }, []);

    return (
        <Tabs activeKey={activeKey} onChange={key => setActiveKey(key)}
            items={vpSourceList.map(vpSource => ({
                key: vpSource.git_vp_source_id,
                label: vpSource.git_vp_source_id,
                children: (
                    <>
                        {vpSource.git_vp_source_id == activeKey && (
                            <GitVpList sourceId={vpSource.git_vp_source_id} />
                        )}
                    </>
                )
            }))} tabPosition="left" style={{ height: "calc(100vh - 130px)" }} type="card" tabBarStyle={{ width: "100px", overflow: "hidden" }} />
    );
};

export default GitVpListPanel;