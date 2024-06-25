//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { Button, Card, Form, List, message, Modal, Popover, Select } from "antd";
import { get_admin_perm, get_admin_session } from "@/api/admin_auth";
import type { AdminPermInfo } from '@/api/admin_auth';
import type { GitVpSourceInfo, GitVpInfo } from "@/api/git_vp";
import { list_git_vp_source, list_git_vp, VP_SORT_BY_TIMESTAMP, VP_SORT_BY_STAR_COUNT, VP_SORT_BY_FORK_COUNT } from "@/api/git_vp";
import { remove_git_vp } from "@/api/git_vp_admin";
import { request } from "@/utils/request";
import { BranchesOutlined, ForkOutlined, MoreOutlined, StarOutlined, TagOutlined } from "@ant-design/icons";
import { open as shell_open } from '@tauri-apps/api/shell';
import AsyncImage from "@/components/AsyncImage";
import defaultIcon from '@/assets/allIcon/app-default-icon.png';


const PAGE_SIZE = 24;

const GitVpRepoList = () => {
    const [permInfo, setPermInfo] = useState<AdminPermInfo | null>(null);
    const [vpSourceList, setVpSourceList] = useState<GitVpSourceInfo[]>([]);
    const [curVpSourceId, setCurVpSourceId] = useState("");

    const [repoList, setRepoList] = useState<GitVpInfo[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);
    const [sortBy, setSortBy] = useState(VP_SORT_BY_TIMESTAMP);
    const [removeRepoInfo, setRemoveRepoInfo] = useState<GitVpInfo | null>(null);

    const loadVpSourceList = async () => {
        const res = await request(list_git_vp_source({}));
        setVpSourceList(res.vp_source_list);
        if (res.vp_source_list.length > 0 && res.vp_source_list.map(item => item.git_vp_source_id).includes(curVpSourceId) == false) {
            setCurVpSourceId(res.vp_source_list[0].git_vp_source_id);
            setSortBy(VP_SORT_BY_TIMESTAMP);
            setCurPage(0);
        }
    };

    const loadRepoList = async () => {
        if (curVpSourceId == "") {
            setTotalCount(0);
            setRepoList([]);
            return;
        }
        const res = await request(list_git_vp({
            git_vp_source_id: curVpSourceId,
            sort_by: sortBy,
            offset: curPage * PAGE_SIZE,
            limit: PAGE_SIZE,
        }));
        setTotalCount(res.total_count);
        setRepoList(res.vp_list);
    };

    const removeRepo = async () => {
        if (removeRepoInfo == null) {
            return;
        }
        const sessionId = await get_admin_session();
        await request(remove_git_vp({
            admin_session_id: sessionId,
            vp_source_id: curVpSourceId,
            web_url: removeRepoInfo.web_url,
        }));
        await loadRepoList();
        message.info("删除成功");
        setRemoveRepoInfo(null);
    };

    useEffect(() => {
        loadVpSourceList();
    }, []);

    useEffect(() => {
        get_admin_perm().then(res => setPermInfo(res));
    }, []);

    useEffect(() => {
        loadRepoList();
    }, [curVpSourceId, curPage, sortBy]);

    return (
        <Card title="代码仓库"
            bodyStyle={{ height: "calc(100vh - 90px)", overflowY: "scroll" }}
            extra={
                <Form layout="inline">
                    <Form.Item label="数据来源">
                        <Select style={{ width: "100px" }} value={curVpSourceId} onChange={value => {
                            setCurVpSourceId(value);
                            setCurPage(0);
                        }}>
                            {vpSourceList.map(item => (
                                <Select.Option key={item.git_vp_source_id} value={item.git_vp_source_id}>
                                    {item.git_vp_source_id}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
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
                        } bodyStyle={{ width: "400px", height: "250px" }}
                            headStyle={{ backgroundColor: "#eee" }}
                            extra={
                                <Popover placement="bottom" trigger="click" content={
                                    <Button type="link" danger disabled={!(permInfo?.git_vp_perm.remove_vp ?? false)}
                                        onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setRemoveRepoInfo(repo);
                                        }}>删除</Button>
                                }>
                                    <MoreOutlined />
                                </Popover>
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
            {removeRepoInfo != null && (
                <Modal open title={removeRepoInfo.name}
                    okText="删除" okButtonProps={{ danger: true }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setRemoveRepoInfo(null);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeRepo();
                    }}>
                    是否删除仓库&nbsp;{removeRepoInfo.name}&nbsp;?
                </Modal>
            )}
        </Card>
    );
}

export default GitVpRepoList;