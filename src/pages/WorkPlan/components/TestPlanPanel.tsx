import React from "react";
import { observer } from 'mobx-react';
import { useStores } from "@/hooks";
import type { CaseInfo, FolderOrCaseInfo } from "@/api/project_testcase";
import { unlink_sprit } from "@/api/project_testcase";
import { Button, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/lib/table";
import { LinkTestCaseInfo } from "@/stores/linkAux";
import { useHistory } from "react-router-dom";
import UserPhoto from "@/components/Portrait/UserPhoto";
import moment from "moment";
import { request } from "@/utils/request";
import type { LocalTestcaseStore } from "@/stores/local";

export interface TestPlanPanelProps {
    testcaseStore: LocalTestcaseStore;
}

const TestPlanPanel = (props: TestPlanPanelProps) => {
    const history = useHistory();

    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const entryStore = useStores('entryStore');
    const memberStore = useStores('memberStore');
    const linkAuxStore = useStores('linkAuxStore');

    const unlinkTestCase = async (caseId: string) => {
        if (entryStore.curEntry == null) {
            return;
        }
        await request(unlink_sprit({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            case_id: caseId,
            sprit_id: entryStore.curEntry.entry_id,
        }));
    };

    const columns: ColumnsType<FolderOrCaseInfo> = [
        {
            title: "名称",
            width: 300,
            render: (_, row: FolderOrCaseInfo) => (
                <a onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    linkAuxStore.goToLink(new LinkTestCaseInfo("", projectStore.curProjectId, row.id, entryStore.curEntry?.entry_id ?? ""), history);
                }}>{row.dataValue.title}</a>

            ),
            fixed: true,
        },
        {
            title: "测试类型",
            width: 200,
            render: (_, row: FolderOrCaseInfo) => (
                <Space style={{ flexWrap: "wrap" }}>
                    {(row.dataValue as CaseInfo).test_method.unit_test && "单元测试"}
                    {(row.dataValue as CaseInfo).test_method.ci_test && "集成测试"}
                    {(row.dataValue as CaseInfo).test_method.load_test && "压力测试"}
                    {(row.dataValue as CaseInfo).test_method.manual_test && "手动测试"}
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
            render: (_, row: FolderOrCaseInfo) => (
                <Space size="small" style={{ flexWrap: "wrap" }}>
                    {row.dataValue.perm_setting.update_for_all == true && "全体成员可修改"}
                    {row.dataValue.perm_setting.update_for_all == false
                        && memberStore.memberList.filter(item => row.dataValue.perm_setting.extra_update_user_id_list.includes(item.member.member_user_id)).map(item => (
                            <Tag icon={<UserPhoto logoUri={item.member.logo_uri} style={{ width: "16px", borderRadius: "10px" }} />} style={{ border: "none", padding: "0px 0px" }}>
                                &nbsp;{item.member.display_name}
                            </Tag>
                        ))}
                </Space>
            ),
        },
        {
            title: "操作",
            width: 80,
            render: (_, row: FolderOrCaseInfo) => (
                <Button type="link" danger disabled={!(entryStore.curEntry?.can_update ?? false)}
                    style={{ minWidth: 0, padding: "0px 0px" }} onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        unlinkTestCase(row.id);
                    }}>移除</Button>
            ),
        },
        {
            title: "创建者",
            width: 120,
            render: (_, row: FolderOrCaseInfo) => (
                <Space>
                    <UserPhoto logoUri={row.dataValue.create_logo_uri} style={{ width: "16px", borderRadius: "10px" }} />
                    {row.dataValue.create_display_name}
                </Space>
            ),
        },
        {
            title: "创建时间",
            width: 120,
            render: (_, row: FolderOrCaseInfo) => moment(row.dataValue.create_time).format("YYYY-MM-DD HH:mm"),
        }
    ];

    return (
        <Table rowKey="id" dataSource={props.testcaseStore.itemList} columns={columns} pagination={false} scroll={{ x: 1100 }} />
    );
};

export default observer(TestPlanPanel);