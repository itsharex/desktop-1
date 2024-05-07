//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { Button, Card, Checkbox, Form, List, Modal, Popover, Space, message } from "antd";
import { MoreOutlined, PlusOutlined } from "@ant-design/icons";
import { useStores } from "@/hooks";
import { ReadOnlyEditor, change_file_owner, useCommonEditor } from "@/components/Editor";
import { FILE_OWNER_TYPE_PROJECT, FILE_OWNER_TYPE_TEST_RESULT } from "@/api/fs";
import type { TestResultInfo } from "@/api/project_testcase";
import { add_test_result, list_test_result, remove_test_result, update_test_result } from "@/api/project_testcase";
import { request } from "@/utils/request";
import UserPhoto from "@/components/Portrait/UserPhoto";
import moment from "moment";

const PAGE_SIZE = 10;

interface ResultCardProps {
    result: TestResultInfo;
    onChange: () => void;
}

const ResultCard = observer((props: ResultCardProps) => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');

    const [inEdit, setInEdit] = useState(false);
    const [testOk, setTestOk] = useState(props.result.test_ok);
    const [showRemoveModal, setShowRemoveModal] = useState(false);

    const { editor, editorRef } = useCommonEditor({
        content: props.result.content,
        fsId: projectStore.curProject?.test_case_fs_id ?? "",
        ownerType: FILE_OWNER_TYPE_TEST_RESULT,
        ownerId: props.result.test_result_id,
        projectId: projectStore.curProjectId,
        historyInToolbar: false,
        clipboardInToolbar: false,
        commonInToolbar: true,
        enableLink: false,
        widgetInToolbar: false,
        showReminder: false,
        pubResInToolbar: false,
        placeholder: "请输入测试结果...",
    });

    const removeResult = async () => {
        await request(remove_test_result({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            test_result_id: props.result.test_result_id,
        }));
        setShowRemoveModal(false);
        props.onChange();
        message.info("移至回收站成功");
    };

    const updateResult = async () => {
        if (editorRef.current == null) {
            return;
        }
        const content = editorRef.current.getContent();
        await request(update_test_result({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            test_result_id: props.result.test_result_id,
            test_ok: testOk,
            content: JSON.stringify(content),
        }));
        setInEdit(false);
        props.onChange();
        message.info("更新成功");
    }

    return (
        <Card title={
            <Space>
                <UserPhoto logoUri={props.result.create_logo_uri} style={{ width: "16px", borderRadius: "10px" }} />
                <span>{props.result.create_display_name}({moment(props.result.create_time).format("YYYY-MM-DD HH:mm")})</span>
            </Space>
        } style={{ width: "100%" }} headStyle={{ padding: "0px" }} bordered={false}
            extra={
                <Space>
                    {(projectStore.isAdmin || userStore.sessionId == props.result.create_user_id) && (
                        <>
                            {inEdit == false && (
                                <>
                                    <Button type="link" onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setTestOk(props.result.test_ok);
                                        const t = setInterval(() => {
                                            if (editorRef.current != null) {
                                                editorRef.current.setContent(props.result.content);
                                                clearInterval(t);
                                            }
                                        }, 100);
                                        setInEdit(true);
                                    }}>编辑</Button>
                                    <Popover trigger="click" placement="bottom" content={
                                        <div style={{ padding: "10px" }}>
                                            <Button type="link" danger onClick={e => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                setShowRemoveModal(true);
                                            }}>删除</Button>
                                        </div>
                                    }>
                                        <MoreOutlined />
                                    </Popover>
                                </>
                            )}
                            {inEdit == true && (
                                <>
                                    <Button onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setTestOk(props.result.test_ok);
                                        const t = setInterval(() => {
                                            if (editorRef.current != null) {
                                                editorRef.current.setContent(props.result.content);
                                                clearInterval(t);
                                            }
                                        }, 100);
                                        setInEdit(false);
                                    }}>取消</Button>
                                    <Button type="primary" onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        updateResult();
                                    }}>保存</Button>
                                </>
                            )}
                        </>
                    )}
                </Space>
            }>
            <Form disabled={!inEdit}>
                <Form.Item label="测试正常">
                    <Checkbox checked={testOk} onChange={e => {
                        e.stopPropagation();
                        setTestOk(e.target.checked);
                    }} />
                </Form.Item>
            </Form>
            {inEdit == false && (
                <ReadOnlyEditor content={props.result.content} />
            )}
            {inEdit == true && (
                <div className="_chatContext">
                    {editor}
                </div>
            )}
            {showRemoveModal == true && (
                <Modal open title="删除测试结果"
                    okText="删除" okButtonProps={{ danger: true }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowRemoveModal(false);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeResult();
                    }}>
                    是否删除测试结果?
                </Modal>
            )}
        </Card>
    );
});


const ResultPanle = () => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');

    const [inEdit, setInEdit] = useState(false);
    const [testOk, setTestOk] = useState(false);

    const [resultList, setResultList] = useState([] as TestResultInfo[]);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);

    const { editor, editorRef } = useCommonEditor({
        content: "",
        fsId: projectStore.curProject?.test_case_fs_id ?? "",
        ownerType: FILE_OWNER_TYPE_PROJECT,
        ownerId: projectStore.curProjectId,
        projectId: projectStore.curProjectId,
        historyInToolbar: false,
        clipboardInToolbar: false,
        commonInToolbar: true,
        enableLink: false,
        widgetInToolbar: false,
        showReminder: false,
        pubResInToolbar: false,
        placeholder: "请输入测试结果...",
    });

    const loadResultList = async () => {
        const res = await request(list_test_result({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            case_id: projectStore.projectModal.testCaseId,
            filter_by_sprit_id: projectStore.projectModal.testCaseLinkSpritId != "",
            sprit_id: projectStore.projectModal.testCaseLinkSpritId,
            offset: PAGE_SIZE * curPage,
            limit: PAGE_SIZE,
        }));
        setTotalCount(res.count);
        setResultList(res.result_list);
    };

    const addTestResult = async () => {
        if (editorRef.current == null) {
            return;
        }
        const content = editorRef.current.getContent();

        const res = await request(add_test_result({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            case_id: projectStore.projectModal.testCaseId,
            sprit_id: projectStore.projectModal.testCaseLinkSpritId,
            test_ok: testOk,
            content: JSON.stringify(content),
        }));

        await change_file_owner(content, userStore.sessionId, FILE_OWNER_TYPE_TEST_RESULT, res.test_result_id);
        editorRef.current.setContent("");
        setTestOk(false);
        setInEdit(false);
        if (curPage != 0) {
            setCurPage(0);
        } else {
            loadResultList();
        }
        message.info("增加成功");
    };



    useEffect(() => {
        loadResultList();
    }, [curPage]);

    return (
        <Card title={projectStore.projectModal.testCaseLinkSpritId == "" ? "包含全部测试结果" : "只包含当前工作计划相关测试结果"}
            headStyle={{ padding: "0px 10px" }} bordered={false}
            bodyStyle={{ height: "calc(100vh - 370px)", overflowY: "scroll" }}
            extra={
                <Space>
                    {inEdit == false && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            editorRef.current?.setContent("");
                            setTestOk(false);
                            setInEdit(true);
                        }}>新增测试结果</Button>
                    )}
                    {inEdit == true && (
                        <>
                            <Button onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                editorRef.current?.setContent("");
                                setTestOk(false);
                                setInEdit(false);
                            }}>取消</Button>
                            <Button type="primary" onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                addTestResult();
                            }}>保存</Button>
                        </>
                    )}
                </Space>
            }>
            {inEdit == true && (
                <Form>
                    <Form.Item label="测试正常">
                        <Checkbox checked={testOk} onChange={e => {
                            e.stopPropagation();
                            setTestOk(e.target.checked);
                        }} />
                    </Form.Item>
                    <Form.Item label="测试详情">
                        <div className="_chatContext">
                            {editor}
                        </div>
                    </Form.Item>
                </Form>
            )}
            <List rowKey="test_result_id" dataSource={resultList}
                pagination={{ current: curPage + 1, total: totalCount, pageSize: PAGE_SIZE, onChange: page => setCurPage(page - 1), hideOnSinglePage: true }}
                renderItem={item => (
                    <List.Item>
                        <ResultCard result={item} onChange={() => loadResultList()} />
                    </List.Item>
                )} />
        </Card>
    );
};

export default observer(ResultPanle);