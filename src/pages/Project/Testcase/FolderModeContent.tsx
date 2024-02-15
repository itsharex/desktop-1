import React, { useEffect, useState } from "react";
import { observer, useLocalObservable } from 'mobx-react';
import type { FolderInfo, CaseInfo, FolderOrCaseInfo } from "@/api/project_testcase";
import { list_folder, list_case, remove_case, remove_folder, update_case, update_folder } from "@/api/project_testcase";
import { useStores } from "@/hooks";
import { request } from "@/utils/request";
import { Button, Modal, Space, Table, Tag } from "antd";
import type { ColumnsType } from 'antd/lib/table';
import { FileOutlined, FolderOpenOutlined } from "@ant-design/icons";
import { EditText } from "@/components/EditCell/EditText";
import { watch, unwatch, WATCH_TARGET_TEST_CASE } from "@/api/project_watch";
import UserPhoto from "@/components/Portrait/UserPhoto";
import moment from "moment";
import s from "./index.module.less";
import SetParentModal from "./SetParentModal";
import { useHistory } from "react-router-dom";
import { LinkTestCaseInfo } from "@/stores/linkAux";
import { LocalTestcaseStore } from "@/stores/local";
import type * as NoticeType from '@/api/notice_type';
import { listen } from '@tauri-apps/api/event';

export interface FolderModeContentProps {
    curFolderId: string;
    onChangeFolder: (folderId: string) => void;
}

const FolderModeContent = (props: FolderModeContentProps) => {
    const history = useHistory();

    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const memberStore = useStores('memberStore');
    const linkAuxStore = useStores('linkAuxStore');

    const testcaseStore = useLocalObservable(() => new LocalTestcaseStore(userStore.sessionId, projectStore.curProjectId, ""));

    const [removeDataInfo, setRemoveDataInfo] = useState<FolderOrCaseInfo | null>(null);
    const [moveDataInfo, setMoveDataInfo] = useState<FolderOrCaseInfo | null>(null);

    const loadDataList = async () => {
        const tmpList = [] as FolderOrCaseInfo[];
        const folderRes = await request(list_folder({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            parent_folder_id: props.curFolderId,
        }));
        for (const folder of folderRes.folder_list) {
            tmpList.push({
                id: folder.folder_id,
                dataType: "folder",
                dataValue: folder,
            });
        }
        const caseRes = await request(list_case({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            parent_folder_id: props.curFolderId,
        }));
        for (const caseInfo of caseRes.case_list) {
            tmpList.push({
                id: caseInfo.case_id,
                dataType: "case",
                dataValue: caseInfo,
            });
        }
        testcaseStore.itemList = tmpList;
        console.log("xxxxxx", testcaseStore.itemList);
    };

    const removeData = async () => {
        if (removeDataInfo == null) {
            return;
        }
        if (removeDataInfo.dataType == "folder") {
            await request(remove_folder({
                session_id: userStore.sessionId,
                project_id: projectStore.curProjectId,
                folder_id: removeDataInfo.id,
            }));
        } else if (removeDataInfo.dataType == "case") {
            await request(remove_case({
                session_id: userStore.sessionId,
                project_id: projectStore.curProjectId,
                case_id: removeDataInfo.id,
            }));
        }
        await loadDataList();
        setRemoveDataInfo(null);
    };

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

    const columns: ColumnsType<FolderOrCaseInfo> = [
        {
            title: "",
            dataIndex: "my_watch",
            width: 40,
            render: (_, row: FolderOrCaseInfo) => (
                <>
                    {row.dataType == "case" && (
                        <a onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            if ((row.dataValue as CaseInfo).my_watch) {
                                unwatchCase(row.id);
                            } else {
                                watchCase(row.id);
                            }
                        }}>
                            <span className={(row.dataValue as CaseInfo).my_watch ? s.isCollect : s.noCollect} />
                        </a>
                    )}

                </>
            ),
            fixed: true,
        },
        {
            title: "名称",
            width: 300,
            render: (_, row: FolderOrCaseInfo) => (
                <Space>
                    {row.dataType == "folder" && <FolderOpenOutlined />}
                    {row.dataType == "case" && <FileOutlined />}
                    <EditText editable={row.dataValue.user_perm.can_update} content={row.dataValue.title}
                        showEditIcon onClick={() => {
                            if (row.dataType == "folder") {
                                props.onChangeFolder(row.id);
                            } else if (row.dataType == "case") {
                                linkAuxStore.goToLink(new LinkTestCaseInfo("", projectStore.curProjectId, row.id), history);
                            }
                        }}
                        onChange={async value => {
                            if (value.trim() == "") {
                                return false;
                            }
                            try {
                                if (row.dataType == "folder") {
                                    await request(update_folder({
                                        session_id: userStore.sessionId,
                                        project_id: projectStore.curProjectId,
                                        folder_id: row.id,
                                        title: value.trim(),
                                    }));
                                } else if (row.dataType == "case") {
                                    await request(update_case({
                                        session_id: userStore.sessionId,
                                        project_id: projectStore.curProjectId,
                                        case_id: row.id,
                                        title: value.trim(),
                                        test_method: (row.dataValue as CaseInfo).test_method,
                                    }));
                                }
                                return true;
                            } catch (e) {
                                console.log(e);
                                return false;
                            }
                        }} />
                </Space>
            ),
            fixed: true,
        },
        {
            title: "目录状态",
            width: 100,
            render: (_, row: FolderOrCaseInfo) => (
                <>
                    {row.dataType == "folder" && (
                        <Space>
                            <div>
                                <FolderOpenOutlined />&nbsp;{(row.dataValue as FolderInfo).sub_folder_count}
                            </div>
                            <div>
                                <FileOutlined />&nbsp;{(row.dataValue as FolderInfo).sub_case_count}
                            </div>
                        </Space>
                    )}
                </>
            ),
        },
        {
            title: "测试类型",
            width: 200,
            render: (_, row: FolderOrCaseInfo) => (
                <>
                    {row.dataType == "case" && (
                        <Space style={{ flexWrap: "wrap" }}>
                            {(row.dataValue as CaseInfo).test_method.unit_test && "单元测试"}
                            {(row.dataValue as CaseInfo).test_method.ci_test && "集成测试"}
                            {(row.dataValue as CaseInfo).test_method.load_test && "压力测试"}
                            {(row.dataValue as CaseInfo).test_method.manual_test && "手动测试"}
                        </Space>
                    )}
                </>
            ),
        },
        {
            title: "测试结果",
            width: 80,
            render: (_, row: FolderOrCaseInfo) => (
                <>
                    {row.dataType == "case" && `${(row.dataValue as CaseInfo).result_count}`}
                </>
            ),
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
            width: 200,
            render: (_, row: FolderOrCaseInfo) => (
                <Space>
                    <Button type="link" disabled={!row.dataValue.user_perm.can_update} onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setMoveDataInfo(row);
                    }}>移动</Button>
                    <Button type="link" danger style={{ minWidth: 0, padding: "0px 0px" }} disabled={!row.dataValue.user_perm.can_remove}
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setRemoveDataInfo(row);
                        }}>删除</Button>
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
        loadDataList();
    }, [props.curFolderId]);

    useEffect(() => {
        //处理新建需求通知
        const unListenFn = listen<NoticeType.AllNotice>('notice', (ev) => {
            if (ev.payload.TestcaseNotice?.NewFolderNotice !== undefined && ev.payload.TestcaseNotice.NewFolderNotice.create_user_id == userStore.userInfo.userId && ev.payload.TestcaseNotice.NewFolderNotice.project_id == projectStore.curProjectId) {
                loadDataList();
            } else if (ev.payload.TestcaseNotice?.NewCaseNotice !== undefined && ev.payload.TestcaseNotice.NewCaseNotice.create_user_id == userStore.userInfo.userId && ev.payload.TestcaseNotice.NewCaseNotice.project_id == projectStore.curProjectId) {
                loadDataList();
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
            <Table rowKey="id" dataSource={testcaseStore.itemList} columns={columns} pagination={false} scroll={{ x: 1400 }} />
            {removeDataInfo != null && (
                <Modal open title={`删除${removeDataInfo.dataType == "folder" ? "目录" : "测试用例"}`}
                    okText="删除" okButtonProps={{ danger: true }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setRemoveDataInfo(null);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeData();
                    }}>
                    是否删除{removeDataInfo.dataType == "folder" ? "目录" : "测试用例"}&nbsp;{removeDataInfo.dataValue.title}&nbsp;?
                </Modal>
            )}
            {moveDataInfo != null && (
                <SetParentModal dataType={moveDataInfo.dataType} dataId={moveDataInfo.id}
                    onCancel={() => setMoveDataInfo(null)} onOk={() => {
                        setMoveDataInfo(null);
                        loadDataList();
                    }} />
            )}
        </div>
    )
};

export default observer(FolderModeContent);