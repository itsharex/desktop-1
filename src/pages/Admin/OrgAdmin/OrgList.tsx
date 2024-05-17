//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { Button, Card, Form, Input, Space, Table, Tag } from "antd";
import s from "./OrgList.module.less";
import Pagination from "@/components/Pagination";
import type { OrgInfo } from "@/api/org";
import type { ColumnsType } from 'antd/es/table';
import { AdminPermInfo, get_admin_perm, get_admin_session } from "@/api/admin_auth";
import { list as list_org } from "@/api/org_admin"
import { request } from "@/utils/request";
import { LinkOutlined } from "@ant-design/icons";
import moment from "moment";
import { ADMIN_PATH_ORG_DETAIL_SUFFIX } from "@/utils/constant";
import type { OrgDetailState } from "./OrgDetail";
import { useHistory } from "react-router-dom";

const PAGE_SIZE = 10;

const OrgList = () => {
    const history = useHistory();
    
    const [keyword, setKeyword] = useState("");
    const [orgList, setOrgList] = useState<OrgInfo[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);
    const [permInfo, setPermInfo] = useState<AdminPermInfo | null>(null);


    const loadOrgList = async () => {
        const sessionId = await get_admin_session();
        const res = await request(list_org({
            admin_session_id: sessionId,
            filter_by_user_id: false,
            user_id: "",
            filter_by_keyword: keyword.trim() != "",
            keyword: keyword.trim(),
            offset: PAGE_SIZE * curPage,
            limit: PAGE_SIZE,
        }));
        setOrgList(res.org_list);
        setTotalCount(res.total_count);
    };

    const columns: ColumnsType<OrgInfo> = [
        {
            title: "团队名称",
            width: 100,
            render: (_, row: OrgInfo) => (
                <Button type="link"
                    style={{ minWidth: 0, paddingLeft: 0 }}
                    disabled={!(permInfo?.org_perm.read ?? false)}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        const orgState:OrgDetailState = {
                            orgId:row.org_id,
                        }
                        history.push(ADMIN_PATH_ORG_DETAIL_SUFFIX, orgState);
                    }}>
                    <LinkOutlined />&nbsp;{row.basic_info.org_name}
                </Button>
            ),
        },
        {
            title: "管理员",
            width: 100,
            dataIndex: "owner_display_name",
        },
        {
            title: "部门数量",
            width: 100,
            dataIndex: "depart_ment_count",
        },
        {
            title: "成员数量",
            width: 100,
            dataIndex: "member_count",
        },
        {
            title: "功能",
            width: 200,
            render: (_, row: OrgInfo) => (
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {row.setting.enable_day_report && <Tag>日报</Tag>}
                    {row.setting.enble_week_report && <Tag>周报</Tag>}
                    {row.setting.enable_okr && <Tag>个人目标</Tag>}
                </div>
            )
        },
        {
            title: "创建时间",
            width: 150,
            render: (_, row: OrgInfo) => moment(row.create_time).format("YYYY-MM-DD HH:mm:ss"),
        },
        {
            title: "更新时间",
            width: 150,
            render: (_, row: OrgInfo) => moment(row.update_time).format("YYYY-MM-DD HH:mm:ss"),
        },
    ];

    useEffect(() => {
        loadOrgList();
    }, [curPage, keyword]);

    useEffect(() => {
        get_admin_perm().then(res => setPermInfo(res));
    }, []);


    return (
        <Card title="团队列表" extra={
            <Space>
                <span className={s.filter_head}>过滤条件</span>
                <Form layout="inline">
                    <Form.Item label="团队名称">
                        <Input allowClear onChange={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setKeyword(e.target.value.trim());
                        }} />
                    </Form.Item>
                </Form>
            </Space>
        }>
            <div className={s.content_wrap}>
                <Table rowKey="org_id" columns={columns} dataSource={orgList} pagination={false} />
                <Pagination total={totalCount} pageSize={PAGE_SIZE} current={curPage + 1} onChange={page => setCurPage(page - 1)} />
            </div>
        </Card>
    );
}

export default OrgList;