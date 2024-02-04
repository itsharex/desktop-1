import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import type { CaseInfo } from "@/api/project_testcase";
import { list_case_flat, remove_case, update_case } from "@/api/project_testcase";
import { request } from "@/utils/request";
import { useStores } from "@/hooks";
import type { ColumnsType } from 'antd/lib/table';
import { watch, unwatch, WATCH_TARGET_TEST_CASE } from "@/api/project_watch";
import UserPhoto from "@/components/Portrait/UserPhoto";
import moment from "moment";
import s from "./index.module.less";
import { EditText } from "@/components/EditCell/EditText";
import Table from "antd/lib/table";
import { Button, Modal, Space, Tag } from "antd";
import { useHistory } from "react-router-dom";
import { LinkTestCaseInfo } from "@/stores/linkAux";

const PAGE_SIZE = 10;

export interface ListModeContentProps {
    filterTitle: string;
    filterMyWatch: boolean;
}

const ListModeContent = (props: ListModeContentProps) => {
    const history = useHistory();

    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const memberStore = useStores('memberStore');
    const linkAuxStore = useStores('linkAuxStore');

    const [curPage, setCurPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [caseInfoList, setCaseInfoList] = useState<CaseInfo[]>([]);
    const [removeCaseInfo, setRemoveCaseInfo] = useState<CaseInfo | null>(null);

    const loadCaseInfoList = async () => {
        const res = await request(list_case_flat({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            list_param: {
                filter_by_title: props.filterTitle != "",
                title: props.filterTitle,
                my_watch: props.filterMyWatch,
            },
            offset: PAGE_SIZE * curPage,
            limit: PAGE_SIZE,
        }));
        setTotalCount(res.count);
        setCaseInfoList(res.case_list);
    }

    const setWatchFlag = (caseId: string, value: boolean) => {
        const tmpList = caseInfoList.slice();
        const index = tmpList.findIndex(item => item.case_id == caseId);
        if (index != -1) {
            tmpList[index].my_watch = value;
            setCaseInfoList(tmpList);
        }
    };

    const watchCase = async (caseId: string) => {
        await request(watch({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            target_type: WATCH_TARGET_TEST_CASE,
            target_id: caseId,
        }));
        setWatchFlag(caseId, true);
    };

    const unwatchCase = async (caseId: string) => {
        await request(unwatch({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            target_type: WATCH_TARGET_TEST_CASE,
            target_id: caseId,
        }));
        setWatchFlag(caseId, false);
    };

    const removeCase = async () => {
        if (removeCaseInfo == null) {
            return;
        }
        await request(remove_case({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            case_id: removeCaseInfo.case_id,
        }));
        setRemoveCaseInfo(null);
        await loadCaseInfoList();
    };

    const columns: ColumnsType<CaseInfo> = [
        {
            title: "",
            dataIndex: "my_watch",
            width: 40,
            render: (_, row: CaseInfo) => (

                <a onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (row.my_watch) {
                        unwatchCase(row.case_id);
                    } else {
                        watchCase(row.case_id);
                    }
                }}>
                    <span className={row.my_watch ? s.isCollect : s.noCollect} />
                </a>

            ),
            fixed: true,
        },
        {
            title: "名称",
            width: 300,
            render: (_, row: CaseInfo) => (
                <EditText editable={row.user_perm.can_update} content={row.title}
                    showEditIcon onClick={() => {
                        linkAuxStore.goToLink(new LinkTestCaseInfo("", projectStore.curProjectId, row.case_id), history);
                    }}
                    onChange={async value => {
                        if (value.trim() == "") {
                            return false;
                        }
                        try {
                            await request(update_case({
                                session_id: userStore.sessionId,
                                project_id: projectStore.curProjectId,
                                case_id: row.case_id,
                                title: value.trim(),
                                test_method: row.test_method,
                            }));
                            return true;
                        } catch (e) {
                            console.log(e);
                            return false;
                        }
                    }} />
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
            title: "操作",
            width: 100,
            render: (_, row: CaseInfo) => (
                <Button type="link" danger style={{ minWidth: 0, padding: "0px 0px" }} disabled={!row.user_perm.can_remove}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setRemoveCaseInfo(row);
                    }}>删除</Button>
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
        if (curPage != 0) {
            setCurPage(0);
        } else {
            loadCaseInfoList();
        }
    }, [projectStore.testCaseVersion, props.filterTitle, props.filterMyWatch]);

    useEffect(() => {
        loadCaseInfoList();
    }, [projectStore.projectModal.testCaseId])

    useEffect(() => {
        loadCaseInfoList();
    }, [curPage]);

    return (
        <div>
            <Table rowKey="case_id" dataSource={caseInfoList} columns={columns}
                scroll={{ x: 1200 }}
                pagination={{ current: curPage + 1, total: totalCount, pageSize: PAGE_SIZE, onChange: page => setCurPage(page - 1) }} />
            {removeCaseInfo != null && (
                <Modal open title="删除测试用例"
                    okText="删除" okButtonProps={{ danger: true }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setRemoveCaseInfo(null);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeCase();
                    }}>
                    是否删除测试用例&nbsp;{removeCaseInfo.title}&nbsp;?
                </Modal>
            )}
        </div>
    );
};

export default observer(ListModeContent);