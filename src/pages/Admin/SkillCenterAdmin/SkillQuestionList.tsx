//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { get_admin_session, get_admin_perm } from '@/api/admin_auth';
import type { AdminPermInfo } from '@/api/admin_auth';
import { list_skill_cate, type SkillCateInfo } from "@/api/skill_center";
import { list_question, get_question, type SkillQuestion } from "@/api/skill_test";
import { add_question, update_question, remove_question } from "@/api/skill_test_admin";

import { request } from "@/utils/request";
import { Button, Card, Form, InputNumber, List, message, Modal, Popover, Select, Space } from "antd";
import { FILE_OWNER_TYPE_NONE } from "@/api/fs";
import { is_empty_doc, ReadOnlyEditor, useCommonEditor } from "@/components/Editor";
import { MoreOutlined } from "@ant-design/icons";

const PAGE_SIZE = 10;

interface EditModalProps {
    curQuestion?: SkillQuestion;
    curCateId: string;
    onCancel: () => void;
    onOk: () => void;
}

const EditModal = (props: EditModalProps) => {
    const [weight, setWeight] = useState(props.curQuestion?.weight ?? 0);

    const { editor, editorRef } = useCommonEditor({
        content: props.curQuestion?.content ?? "",
        fsId: "",
        ownerType: FILE_OWNER_TYPE_NONE,
        ownerId: "",
        projectId: "",
        historyInToolbar: false,
        clipboardInToolbar: false,
        commonInToolbar: true,
        widgetInToolbar: false,
        showReminder: false,
        pubResInToolbar: false,
    });

    const addQuestion = async () => {
        const content = editorRef.current?.getContent() ?? {
            type: 'doc',
        };
        if (is_empty_doc(content)) {
            message.warn("内容不能为空");
            return;
        }
        const sessionId = await get_admin_session();
        await request(add_question({
            admin_session_id: sessionId,
            cate_id: props.curCateId,
            content: JSON.stringify(content),
            weight: weight,
        }));
        props.onOk();
    };

    const updateQuestion = async () => {
        if (props.curQuestion == undefined) {
            return;
        }
        const content = editorRef.current?.getContent() ?? {
            type: 'doc',
        };
        if (is_empty_doc(content)) {
            message.warn("内容不能为空");
            return;
        }
        const sessionId = await get_admin_session();
        await request(update_question({
            admin_session_id: sessionId,
            question_id: props.curQuestion.question_id,
            cate_id: props.curCateId,
            content: JSON.stringify(content),
            weight: weight,
        }));
        props.onOk();
    };

    return (
        <Modal open title={`${props.curQuestion == undefined ? "增加" : "修改"}问题`}
            okText={props.curQuestion == undefined ? "增加" : "修改"} width={800}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                if (props.curQuestion == undefined) {
                    addQuestion();
                } else {
                    updateQuestion();
                }
            }}>
            <Form labelCol={{ span: 2 }}>
                <Form.Item label="权重">
                    <InputNumber value={weight} controls={false} min={0} max={99} precision={0} onChange={value => {
                        if (value != null) {
                            setWeight(value);
                        }
                    }} />
                </Form.Item>
                <Form.Item>
                    <div className="_chatContext">
                        {editor}
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
};

const SkillQuestionList = () => {
    const [permInfo, setPermInfo] = useState<AdminPermInfo | null>(null);
    const [cateList, setCateList] = useState<SkillCateInfo[]>([]);
    const [curCateId, setCurCateId] = useState("");
    const [questionList, setQuestionList] = useState<SkillQuestion[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);
    const [showAddModal, setShowAddModal] = useState(false);
    const [updateQuestionInfo, setUpdateQuestionInfo] = useState<SkillQuestion | null>(null);
    const [removeQuestionInfo, setRemoveQuestionInfo] = useState<SkillQuestion | null>(null);


    const loadCateList = async () => {
        const sessionId = await get_admin_session();
        const res = await request(list_skill_cate({
            session_id: sessionId,
            filter_publish: false,
            publish: false,
        }));
        setCateList(res.cate_list);
        if (res.cate_list.map(item => item.cate_id).includes(curCateId) == false) {
            if (res.cate_list.length > 0) {
                setCurCateId(res.cate_list[0].cate_id);
            }
        }
    };

    const loadQuestionList = async () => {
        if (curCateId == "") {
            setQuestionList([]);
            return;
        }
        const sessionId = await get_admin_session();
        const res = await request(list_question({
            session_id: sessionId,
            cate_id: curCateId,
            offset: curPage * PAGE_SIZE,
            limit: PAGE_SIZE,
        }));
        setQuestionList(res.question_list);
        setTotalCount(res.total_count);
    };

    const onUpdateQuestion = async (questionId: string) => {
        const tmpList = questionList.slice();
        const index = tmpList.findIndex(item => item.question_id == questionId);
        if (index == -1) {
            return;
        }
        const sessionId = await get_admin_session();
        const res = await request(get_question({
            session_id: sessionId,
            cate_id: curCateId,
            question_id: questionId,
        }));
        tmpList[index] = res.question;
        setQuestionList(tmpList);
    };

    const removeQuestion = async (questionId: string) => {
        const sessionId = await get_admin_session();
        await request(remove_question({
            admin_session_id: sessionId,
            cate_id: curCateId,
            question_id: questionId,
        }));
        await loadQuestionList();
    };

    useEffect(() => {
        get_admin_perm().then(res => setPermInfo(res));
    }, []);

    useEffect(() => {
        loadCateList();
    }, []);

    useEffect(() => {
        loadQuestionList();
    }, [curCateId, curPage]);

    return (
        <Card title="技能问答"
            bodyStyle={{ height: "calc(100vh - 90px)", overflowY: "scroll", padding: "0px 0px" }}
            extra={
                <Form layout="inline">
                    <Form.Item label="技能类别">
                        <Select style={{ width: "100px" }} value={curCateId} onChange={value => setCurCateId(value)}>
                            {cateList.map(item => (
                                <Select.Option key={item.cate_id} value={item.cate_id}>{item.cate_name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" disabled={!(permInfo?.skill_center_perm.add_question ?? false)}
                            onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setShowAddModal(true);
                            }}>增加问题</Button>
                    </Form.Item>
                </Form>
            }>
            <List rowKey="question_id" dataSource={questionList}
                pagination={{ total: totalCount, current: curPage + 1, pageSize: PAGE_SIZE, onChange: page => setCurPage(page - 1), hideOnSinglePage: true, showSizeChanger: false }}
                renderItem={item => (
                    <Card bordered={false} style={{ width: "100%" }} extra={
                        <Space>
                            <span>权重:{item.weight}</span>
                            <Button type="link" disabled={!(permInfo?.skill_center_perm.update_question ?? false)}
                                onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setUpdateQuestionInfo(item);
                                }}>修改</Button>
                            <Popover trigger="click" placement="bottom" content={
                                <Space direction="vertical">
                                    <Button type="link" danger disabled={!(permInfo?.skill_center_perm.remove_question ?? false)}
                                        onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setRemoveQuestionInfo(item);
                                        }}>删除</Button>
                                </Space>
                            }>
                                <MoreOutlined />
                            </Popover>
                        </Space>
                    } >
                        <ReadOnlyEditor content={item.content} />
                    </Card>
                )} />
            {showAddModal == true && (
                <EditModal curCateId={curCateId} onCancel={() => setShowAddModal(false)}
                    onOk={() => {
                        setShowAddModal(false);
                        if (curPage != 0) {
                            setCurPage(0);
                        } else {
                            loadQuestionList();
                        }
                    }}
                />
            )}
            {updateQuestionInfo != null && (
                <EditModal curQuestion={updateQuestionInfo} curCateId={curCateId} onCancel={() => setUpdateQuestionInfo(null)}
                    onOk={() => {
                        onUpdateQuestion(updateQuestionInfo.question_id);
                        setUpdateQuestionInfo(null);
                    }} />
            )}
            {removeQuestionInfo != null && (
                <Modal open title="删除问题"
                    okText="删除" okButtonProps={{ danger: true }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setRemoveQuestionInfo(null);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeQuestion(removeQuestionInfo.question_id);
                        setRemoveQuestionInfo(null);
                    }}>
                    是否删除当前问题？
                </Modal>
            )}
        </Card>
    );
};

export default SkillQuestionList;