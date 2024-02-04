import React, { useEffect } from "react";
import { observer } from 'mobx-react';
import { useStores } from "@/hooks";
import type { CaseInfo } from "@/api/project_testcase";
import { Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/lib/table";
import { LinkTestCaseInfo } from "@/stores/linkAux";
import { useHistory } from "react-router-dom";
import UserPhoto from "@/components/Portrait/UserPhoto";
import moment from "moment";


const TestPlanPanel = () => {
    const history = useHistory();

    const projectStore = useStores('projectStore');
    const spritStore = useStores('spritStore');
    const entryStore = useStores('entryStore');
    const memberStore = useStores('memberStore');
    const linkAuxStore = useStores('linkAuxStore');

    const columns: ColumnsType<CaseInfo> = [
        {
            title: "名称",
            width: 300,
            render: (_, row: CaseInfo) => (
                <a onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    linkAuxStore.goToLink(new LinkTestCaseInfo("", projectStore.curProjectId, row.case_id, entryStore.curEntry?.entry_id ?? ""), history);
                }}>{row.title}</a>

            ),
            fixed: true,
        },
        {
            title: "测试类型",
            width: 200,
            render: (_, row: CaseInfo) => (
                <Space style={{ flexWrap: "wrap" }}>
                    {row.test_method.unit_test && "单元测试"}
                    {row.test_method.ci_test && "集成测试"}
                    {row.test_method.load_test && "压力测试"}
                    {row.test_method.manual_test && "手动测试"}
                </Space>
            ),
        },
        {
            title: "测试结果",
            width: 80,
            dataIndex: "result_count",
        },
        {
            title: "修改权限",
            width: 200,
            render: (_, row: CaseInfo) => (
                <Space size="small" style={{ flexWrap: "wrap" }}>
                    {row.perm_setting.update_for_all == true && "全体成员可修改"}
                    {row.perm_setting.update_for_all == false
                        && memberStore.memberList.filter(item => row.perm_setting.extra_update_user_id_list.includes(item.member.member_user_id)).map(item => (
                            <Tag icon={<UserPhoto logoUri={item.member.logo_uri} style={{ width: "16px", borderRadius: "10px" }} />} style={{ border: "none", padding: "0px 0px" }}>
                                &nbsp;{item.member.display_name}
                            </Tag>
                        ))}
                </Space>
            ),
        },
        {
            title: "创建者",
            width: 120,
            render: (_, row: CaseInfo) => (
                <Space>
                    <UserPhoto logoUri={row.create_logo_uri} style={{ width: "16px", borderRadius: "10px" }} />
                    {row.create_display_name}
                </Space>
            ),
        },
        {
            title: "创建时间",
            width: 120,
            render: (_, row: CaseInfo) => moment(row.create_time).format("YYYY-MM-DD HH:mm"),
        }
    ];

    useEffect(() => {
        if (projectStore.projectModal.testCaseId == "") {
            spritStore.loadCaseList();
        }
    }, [projectStore.projectModal.testCaseId])

    return (
        <Table rowKey="case_id" dataSource={spritStore.caseList} columns={columns} pagination={false} scroll={{ x: 1000 }} />
    );
};

export default observer(TestPlanPanel);