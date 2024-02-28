import React, { useEffect, useState } from "react";
import { observer, useLocalObservable } from 'mobx-react';
import type { CaseInfo, FolderOrCaseInfo } from "@/api/project_testcase";
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
import { Button, Modal, Popover, Space, Tag } from "antd";
import { useHistory } from "react-router-dom";
import { LinkTestCaseInfo } from "@/stores/linkAux";
import { LocalTestcaseStore } from "@/stores/local";
import type * as NoticeType from '@/api/notice_type';
import { listen } from '@tauri-apps/api/event';
import { MoreOutlined } from "@ant-design/icons";

const PAGE_SIZE = 10;

export interface ListModeContentProps {
    filterTitle: string;
    filterMyWatch: boolean;
    resetFilter: () => void;
}

const ListModeContent = (props: ListModeContentProps) => {
    const history = useHistory();

    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const memberStore = useStores('memberStore');
    const linkAuxStore = useStores('linkAuxStore');

    const testcaseStore = useLocalObservable(() => new LocalTestcaseStore(userStore.sessionId, projectStore.curProjectId, ""));

    const [curPage, setCurPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
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
        testcaseStore.itemList = res.case_list.map(item => ({
            id: item.case_id,
            dataType: "case",
            dataValue: item,
        }))
    }

    const watchCase = async (caseId: string) => {
        await request(watch({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            target_type: WATCH_TARGET_TEST_CASE,
            target_id: caseId,
        }));
        testcaseStore.setWatch(caseId, true);
    };

    const unwatchCase = async (caseId: string) => {
        await request(unwatch({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            target_type: WATCH_TARGET_TEST_CASE,
            target_id: caseId,
        }));
        testcaseStore.setWatch(caseId, false);
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

    const columns: ColumnsType<FolderOrCaseInfo> = [
        {
            title: "",
            dataIndex: "my_watch",
            width: 40,
            render: (_, row: FolderOrCaseInfo) => (

                <a onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (row.dataType == "case") {
                        if ((row.dataValue as CaseInfo).my_watch) {
                            unwatchCase(row.id);
                        } else {
                            watchCase(row.id);
                        }
                    }

                }}>
                    <span className={(row.dataValue as CaseInfo).my_watch ? s.isCollect : s.noCollect} />
                </a>

            ),
            fixed: true,
        },
        {
            title: "名称",
            width: 400,
            render: (_, row: FolderOrCaseInfo) => (
                <Space size="middle">
                    <EditText editable={row.dataValue.user_perm.can_update} content={row.dataValue.title}
                        showEditIcon onClick={() => {
                            linkAuxStore.goToLink(new LinkTestCaseInfo("", projectStore.curProjectId, row.id), history);
                        }}
                        onChange={async value => {
                            if (value.trim() == "") {
                                return false;
                            }
                            try {
                                await request(update_case({
                                    session_id: userStore.sessionId,
                                    project_id: projectStore.curProjectId,
                                    case_id: row.id,
                                    title: value.trim(),
                                    test_method: (row.dataValue as CaseInfo).test_method,
                                }));
                                return true;
                            } catch (e) {
                                console.log(e);
                                return false;
                            }
                        }} />
                    <Popover trigger="click" placement="bottom" content={
                        <Space direction="vertical" style={{ padding: "10px 10px" }}>
                            <Button type="link" danger style={{ minWidth: 0, padding: "0px 0px" }} disabled={!row.dataValue.user_perm.can_remove}
                                onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setRemoveCaseInfo(row.dataValue as CaseInfo);
                                }}>移至回收站</Button>
                        </Space>
                    }>
                        <MoreOutlined />
                    </Popover>
                </Space>
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

    useEffect(() => {
        loadCaseInfoList();
    }, [curPage, props.filterTitle, props.filterMyWatch]);

    useEffect(() => {
        //处理新建需求通知
        const unListenFn = listen<NoticeType.AllNotice>('notice', (ev) => {
            if (ev.payload.TestcaseNotice?.NewCaseNotice !== undefined && ev.payload.TestcaseNotice.NewCaseNotice.create_user_id == userStore.userInfo.userId && ev.payload.TestcaseNotice.NewCaseNotice.project_id == projectStore.curProjectId) {
                let hasChange = false;
                if (curPage != 0) {
                    setCurPage(0);
                    hasChange = true;
                }
                if (props.filterTitle != "" || props.filterMyWatch) {
                    props.resetFilter();
                    hasChange = true;
                }
                if (!hasChange) {
                    loadCaseInfoList();
                }
            }
        });

        return () => {
            unListenFn.then((unListen) => unListen());
        };
    }, []);

    useEffect(() => {
        return () => {
            testcaseStore.unlisten();
        };
    }, []);

    return (
        <div>
            <Table rowKey="id" dataSource={testcaseStore.itemList} columns={columns}
                scroll={{ x: 1200 }}
                pagination={{ current: curPage + 1, total: totalCount, pageSize: PAGE_SIZE, onChange: page => setCurPage(page - 1) }} />
            {removeCaseInfo != null && (
                <Modal open title="移至回收站"
                    okText="移至" okButtonProps={{ danger: true }}
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
                    是否把测试用例&nbsp;{removeCaseInfo.title}&nbsp;移至回收站?
                </Modal>
            )}
        </div>
    );
};

export default observer(ListModeContent);