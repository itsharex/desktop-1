import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import type { RequirementInfo } from "@/api/project_requirement";
import { get_requirement, update_requirement, open_requirement, close_requirement, remove_requirement } from "@/api/project_requirement";
import { Button, Card, Form, Modal, Popover, Space } from "antd";
import { useStores } from "@/hooks";
import { request } from "@/utils/request";
import { EditText } from "@/components/EditCell/EditText";
import { ReadOnlyEditor, useCommonEditor } from "@/components/Editor";
import { FILE_OWNER_TYPE_REQUIRE_MENT } from "@/api/fs";
import { EditTag } from "@/components/EditCell/EditTag";
import { MoreOutlined } from "@ant-design/icons";


const DetailPanel = () => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');

    const [reqInfo, setReqInfo] = useState<RequirementInfo | null>(null);
    const [inEditContent, setInEditContent] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);

    const { editor, editorRef } = useCommonEditor({
        content: "",
        fsId: projectStore.curProject?.require_ment_fs_id ?? "",
        ownerType: FILE_OWNER_TYPE_REQUIRE_MENT,
        ownerId: projectStore.projectModal.requirementId,
        projectId: projectStore.curProjectId,
        historyInToolbar: false,
        clipboardInToolbar: false,
        commonInToolbar: true,
        enableLink: false,
        widgetInToolbar: false,
        showReminder: false,
        placeholder: "请输入需求...",
    });

    const loadReqInfo = async () => {
        const res = await request(get_requirement({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            requirement_id: projectStore.projectModal.requirementId,
        }));
        setReqInfo(res.requirement);
    };

    const updateContent = async () => {
        if (editorRef.current == null) {
            return;
        }
        if (reqInfo == null) {
            return;
        }
        const content = editorRef.current.getContent();
        await request(update_requirement({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            requirement_id: projectStore.projectModal.requirementId,
            base_info: {
                title: reqInfo.base_info.title,
                content: JSON.stringify(content),
                tag_id_list: reqInfo.base_info.tag_id_list,
            },
        }));
        setReqInfo(oldValue => {
            if (oldValue != null) {
                oldValue.base_info.content = JSON.stringify(content);
            }
            return oldValue;
        });
        setInEditContent(false);
    };

    const updateTagIdList = async (tagIdList: string[]) => {
        if (reqInfo == null) {
            return;
        }
        await request(update_requirement({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            requirement_id: projectStore.projectModal.requirementId,
            base_info: {
                title: reqInfo.base_info.title,
                content: reqInfo.base_info.content,
                tag_id_list: tagIdList,
            },
        }));
        setReqInfo(oldValue => {
            if (oldValue != null) {
                oldValue.base_info.tag_id_list = tagIdList;
            }
            return oldValue;
        });
    };

    const removeRequirement = async () => {
        await request(remove_requirement({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            requirement_id: projectStore.projectModal.requirementId,
        }));
        setShowRemoveModal(false);
        projectStore.projectModal.requirementId = "";
        projectStore.projectModal.requirementTab = "detail";
    };

    useEffect(() => {
        loadReqInfo();
    }, [projectStore.projectModal.requirementId]);

    return (
        <div>
            {reqInfo != null && (
                <>
                    <Card title={
                        <>
                            <span style={{ fontSize: "16px", fontWeight: 600 }}>标题:&nbsp;</span>
                            <EditText editable={reqInfo.user_requirement_perm.can_update} content={reqInfo.base_info.title} showEditIcon
                                fontSize="16px" fontWeight={600}
                                onChange={async value => {
                                    if (value.trim() == "") {
                                        return false;
                                    }
                                    try {
                                        await request(update_requirement({
                                            session_id: userStore.sessionId,
                                            project_id: projectStore.curProjectId,
                                            requirement_id: projectStore.projectModal.requirementId,
                                            base_info: {
                                                title: value.trim(),
                                                content: reqInfo.base_info.content,
                                                tag_id_list: reqInfo.base_info.tag_id_list,
                                            },
                                        }));
                                        setReqInfo(oldValue => {
                                            if (oldValue != null) {
                                                oldValue.base_info.title = value.trim();
                                            }
                                            return oldValue;
                                        });
                                        return true;
                                    } catch (e) {
                                        console.log(e);
                                        return false;
                                    }
                                }}
                            />
                        </>
                    }
                        headStyle={{ padding: "0px 10px" }} bordered={false}
                        extra={
                            <Space>
                                {inEditContent == false && reqInfo.user_requirement_perm.can_update && (
                                    <Button type="primary" onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setInEditContent(true);
                                        const t = setInterval(() => {
                                            if (editorRef.current != null) {
                                                editorRef.current.setContent(reqInfo.base_info.content);
                                                clearInterval(t);
                                            }
                                        }, 100);
                                    }}>编辑</Button>
                                )}
                                {inEditContent == false && (
                                    <Popover trigger="click" placement="bottom" content={
                                        <Space direction="vertical" style={{ padding: "10px 10px" }}>
                                            {reqInfo.user_requirement_perm.can_open && (
                                                <Button type="link" onClick={e => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    request(open_requirement({
                                                        session_id: userStore.sessionId,
                                                        project_id: projectStore.curProjectId,
                                                        requirement_id: projectStore.projectModal.requirementId,
                                                    })).then(() => loadReqInfo());
                                                }}>打开需求</Button>
                                            )}
                                            {reqInfo.user_requirement_perm.can_close && (
                                                <Button type="link" onClick={e => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    request(close_requirement({
                                                        session_id: userStore.sessionId,
                                                        project_id: projectStore.curProjectId,
                                                        requirement_id: projectStore.projectModal.requirementId,
                                                    })).then(() => loadReqInfo());
                                                }}>关闭需求</Button>
                                            )}
                                            <Button type="link" danger disabled={!reqInfo.user_requirement_perm.can_remove}
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    setShowRemoveModal(true);
                                                }}>移至回收站</Button>
                                        </Space>
                                    }>
                                        <MoreOutlined />
                                    </Popover>
                                )}
                                {inEditContent == true && (
                                    <>
                                        <Button onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setInEditContent(false);
                                        }}>取消</Button>
                                        <Button type="primary" onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            updateContent();
                                        }}>保存</Button>
                                    </>
                                )}
                            </Space>
                        }>
                        {inEditContent == false && (
                            <div className="_chatContext">
                                <ReadOnlyEditor content={reqInfo.base_info.content} />
                            </div>
                        )}
                        {inEditContent == true && (
                            <div className="_chatContext">
                                {editor}
                            </div>
                        )}
                    </Card>
                    <Card title={<span style={{ fontSize: "16px", fontWeight: 600 }}>其他配置</span>} headStyle={{ padding: "0px 10px" }} bordered={false} >
                        <Form>
                            <Form.Item label="标签">
                                <EditTag editable={reqInfo.user_requirement_perm.can_update} tagIdList={reqInfo.base_info.tag_id_list}
                                    tagDefList={(projectStore.curProject?.tag_list ?? []).filter(item => item.use_in_req)}
                                    onChange={tagIdList => updateTagIdList(tagIdList)} />
                            </Form.Item>
                        </Form>
                    </Card>
                    {showRemoveModal == true && (
                        <Modal open title="移至回收站"
                            okText="移至" okButtonProps={{ danger: true }}
                            onCancel={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setShowRemoveModal(false);
                            }}
                            onOk={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                removeRequirement();
                            }}>
                            是否把项目需求&nbsp;{reqInfo.base_info.title}&nbsp;移至回收站?
                        </Modal>
                    )}
                </>
            )}
        </div>
    )
};

export default observer(DetailPanel);