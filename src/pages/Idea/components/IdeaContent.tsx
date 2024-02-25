import React, { useState } from "react";
import type { Idea, APPRAISE_TYPE, IdeaGroup } from "@/api/project_idea";
import {
    APPRAISE_AGREE, APPRAISE_DIS_AGREE, set_appraise, cancel_appraise,
    update_idea_content, remove_idea, update_idea_keyword, move_idea,
} from "@/api/project_idea";
import { Card, Divider, Input, Modal, Popover, Select, Space, Tag, message } from "antd";
import { ReadOnlyEditor, useCommonEditor } from '@/components/Editor';
import s from "./IdeaContent.module.less";
import { DislikeFilled, DislikeOutlined, EditOutlined, LikeFilled, LikeOutlined, MoreOutlined } from "@ant-design/icons";
import { observer } from 'mobx-react';
import { request } from "@/utils/request";
import { useStores } from "@/hooks";
import Button from "@/components/Button";
import { FILE_OWNER_TYPE_IDEA } from "@/api/fs";
import IdeaAppraiseModal from "./IdeaAppraiseModal";
import IdeaEventModal from "./IdeaEventModal";
import UserPhoto from "@/components/Portrait/UserPhoto";
import EditPermModal from "./EditPermModal";
import { EditSelect } from "@/components/EditCell/EditSelect";

interface IdeaContentProps {
    idea: Idea;
    groupList: IdeaGroup[];
}

const IdeaContent: React.FC<IdeaContentProps> = (props) => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const ideaStore = useStores('ideaStore');
    const memberStore = useStores('memberStore');

    const [title, setTitle] = useState(props.idea.basic_info.title);
    const [inEditContent, setInEditContent] = useState(false);

    const [inEditKeyword, setInEditKeyword] = useState(false);
    const [keywordList, setKeywordList] = useState(props.idea.basic_info.keyword_list);

    const [showAppraise, setShowAppraise] = useState(false);
    const [showEvent, setShowEvent] = useState(false);
    const [showRemove, setShowRemove] = useState(false);

    const [showEditPermModal, setShowEditPermModal] = useState(false);

    const { editor, editorRef } = useCommonEditor({
        content: props.idea.basic_info.content,
        fsId: projectStore.curProject?.idea_fs_id ?? "",
        ownerType: FILE_OWNER_TYPE_IDEA,
        ownerId: props.idea.idea_id,
        projectId: projectStore.curProjectId,
        historyInToolbar: false,
        clipboardInToolbar: false,
        commonInToolbar: true,
        widgetInToolbar: false,
        showReminder: false,
    });

    const setAgree = async (appraiseType: APPRAISE_TYPE) => {
        await request(set_appraise({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            idea_id: props.idea.idea_id,
            appraise_type: appraiseType,
        }));
    };

    const cancelAgree = async () => {
        await request(cancel_appraise({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            idea_id: props.idea.idea_id,
        }));
    };

    const updateContent = async () => {
        if (title.trim() == "") {
            message.error("标题不能为空");
            return;
        }
        const content = editorRef.current?.getContent() ?? {
            type: 'doc',
        };
        await request(update_idea_content({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            idea_id: props.idea.idea_id,
            title: title.trim(),
            content: JSON.stringify(content),
        }));
        setInEditContent(false);
    };

    const removeIdea = async () => {
        await request(remove_idea({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            idea_id: props.idea.idea_id,
        }));
        setShowRemove(false);
    }

    const updateKeyword = async () => {
        await request(update_idea_keyword({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            idea_id: props.idea.idea_id,
            keyword_list: keywordList,
        }));
        setInEditKeyword(false);
    }

    return (
        <div className={s.content_wrap}>
            <div className={s.content}>
                <Card title={
                    <Space style={{ fontSize: "20px" }}>
                        {inEditContent == false && props.idea.basic_info.title}
                        {inEditContent == true && (
                            <Input value={title} style={{ width: "calc(100vw - 1000px)" }} onChange={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setTitle(e.target.value);
                            }} />
                        )}
                    </Space>
                } bordered={false} extra={
                    <>
                        {inEditContent == false && (
                            <Space size="small">
                                <Button disabled={!props.idea.user_perm.can_update}
                                    onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setTitle(props.idea.basic_info.title);
                                        editorRef.current?.setContent(props.idea.basic_info.content);
                                        setInEditContent(true);
                                    }}>编辑</Button>
                                <Button type="text" style={{ minWidth: 0, padding: "0px 0px" }}>
                                    <Popover placement="bottom" trigger="click" content={
                                        <div style={{ padding: "10px 10px" }}>
                                            <div>
                                                <Button type="link" onClick={e => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    setShowEvent(true);
                                                }}>查看操作记录</Button>
                                            </div>
                                            <div>
                                                <Button type="link" onClick={e => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    setShowAppraise(true);
                                                }}>查看评价详情</Button>
                                            </div>
                                            <Divider style={{ margin: "4px" }} />
                                            <div>
                                                <Button type="link" danger disabled={!props.idea.user_perm.can_remove} onClick={e => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    setShowRemove(true);
                                                }}>删除知识点</Button>
                                            </div>
                                        </div>
                                    }>
                                        <MoreOutlined style={{ fontSize: "16px" }} />
                                    </Popover>
                                </Button>
                            </Space>
                        )}
                        {inEditContent == true && (
                            <Space size="small">
                                <Button type="default" onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setTitle(props.idea.basic_info.title);
                                    editorRef.current?.setContent(props.idea.basic_info.content);
                                    setInEditContent(false);
                                }}>取消</Button>
                                <Button disabled={title.trim() == ""} onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    updateContent();
                                }}>保存</Button>
                            </Space>
                        )}
                    </>
                }>
                    {inEditContent == false && (
                        <div className="_editChatContext">
                            <ReadOnlyEditor content={props.idea.basic_info.content} />
                        </div>
                    )}
                    {inEditContent == true && (
                        <div className="_editChatContext">
                            {editor}
                        </div>
                    )}
                </Card>
            </div>
            <div className={s.side}>
                <div className={s.extra_info}>
                    <h3>关键词:</h3>
                    {inEditKeyword == false && (
                        <div>
                            {props.idea.basic_info.keyword_list.map(keyword => (
                                <Tag key={keyword}>{keyword}</Tag>
                            ))}
                            {props.idea.user_perm.can_update && <a onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setInEditKeyword(true);
                            }}><EditOutlined /></a>}
                        </div>
                    )}
                    {inEditKeyword == true && (
                        <>
                            <Select value={keywordList} mode="tags"
                                style={{ width: "100%" }}
                                onChange={value => {
                                    if ((value as string[]).length > 0) {
                                        setKeywordList((value as string[]).map(item => item.toLowerCase()));
                                    }
                                }}
                                placement="topLeft">
                                {ideaStore.keywordList.map(keyword => (
                                    <Select.Option key={keyword} value={keyword}>{keyword}</Select.Option>
                                ))}
                            </Select>
                            <div className={s.btn_wrap}>
                                <Space className={s.btn}>
                                    <Button type="default" onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setKeywordList(props.idea.basic_info.keyword_list);
                                        setInEditKeyword(false);
                                    }}>取消</Button>
                                    <Button onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        updateKeyword();
                                    }}>保存</Button>
                                </Space>
                            </div>
                        </>
                    )}
                    <h3>分组</h3>
                    <div>
                        <EditSelect editable={props.idea.user_perm.can_update} curValue={props.idea.idea_group_id} itemList={props.groupList.map(item => ({
                            value: item.idea_group_id,
                            label: item.name,
                            color: "black"
                        }))}
                            onChange={async (value: string | number | undefined) => {
                                try {
                                    await request(move_idea({
                                        session_id: userStore.sessionId,
                                        project_id: projectStore.curProjectId,
                                        idea_id: props.idea.idea_id,
                                        idea_group_id: value as string,
                                    }));
                                    message.info("设置成功");
                                    return true;
                                } catch (e) {
                                    console.log(e);
                                    return false;
                                }
                            }} showEditIcon={true} allowClear={false} width="100%" />
                    </div>
                    <h3>编辑权限</h3>
                    {props.idea.idea_perm.update_for_all == true && (
                        <Space>
                            <span>全体成员可编辑</span>
                            {props.idea.user_perm.can_update && (
                                <Button type="link" icon={<EditOutlined />} style={{ minWidth: 0, padding: "0px 0px" }} onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setShowEditPermModal(true);
                                }} />
                            )}
                        </Space>
                    )}
                    {props.idea.idea_perm.update_for_all == false && (
                        <div>
                            {props.idea.idea_perm.extra_update_user_id_list.map(userId => memberStore.getMember(userId)).filter(member => member != undefined).map(member => (
                                <Tag key={member?.member.member_user_id}>
                                    <Space>
                                        <UserPhoto logoUri={member?.member.logo_uri ?? ""} style={{ width: "16px", borderRadius: "10px" }} />
                                        {member?.member.display_name}
                                    </Space>
                                </Tag>
                            ))}
                            {props.idea.user_perm.can_update && <a onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setShowEditPermModal(true);
                            }}><EditOutlined /></a>}
                        </div>
                    )}
                </div>
                <div className={s.agree_wrap}>
                    <div>
                        {!(props.idea.has_my_appraise && props.idea.my_appraise_type == APPRAISE_AGREE) && (
                            <Button type="text" style={{ minWidth: 0, padding: "0px 0px" }} disabled={!props.idea.user_perm.can_appraise}
                                onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setAgree(APPRAISE_AGREE);
                                }}><span className={s.icon}><LikeOutlined />&nbsp;{props.idea.agree_count}</span></Button>
                        )}
                        {props.idea.has_my_appraise && props.idea.my_appraise_type == APPRAISE_AGREE && (
                            <Button type="text" style={{ minWidth: 0, padding: "0px 0px" }} disabled={!props.idea.user_perm.can_appraise}
                                onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    cancelAgree();
                                }}><span className={s.icon}><LikeFilled />&nbsp;{props.idea.agree_count}</span></Button>
                        )}
                    </div>
                    <div>
                        {!(props.idea.has_my_appraise && props.idea.my_appraise_type == APPRAISE_DIS_AGREE) && (
                            <Button type="text" style={{ minWidth: 0, padding: "0px 0px" }} disabled={!props.idea.user_perm.can_appraise}
                                onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setAgree(APPRAISE_DIS_AGREE);
                                }}><span className={s.icon}><DislikeOutlined />&nbsp;{props.idea.disagree_count}</span></Button>
                        )}
                        {props.idea.has_my_appraise && props.idea.my_appraise_type == APPRAISE_DIS_AGREE && (
                            <Button type="text" style={{ minWidth: 0, padding: "0px 0px" }} disabled={!props.idea.user_perm.can_appraise}
                                onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    cancelAgree();
                                }}><span className={s.icon}><DislikeFilled />&nbsp;{props.idea.disagree_count}</span></Button>
                        )}

                    </div>
                </div>
            </div>
            {showAppraise == true && (
                <IdeaAppraiseModal ideaId={props.idea.idea_id} onCancel={() => setShowAppraise(false)} />
            )}
            {showEvent == true && (
                <IdeaEventModal ideaId={props.idea.idea_id} onCancel={() => setShowEvent(false)} />
            )}
            {showRemove == true && (
                <Modal open title="删除知识点"
                    okText="删除" okButtonProps={{ danger: true }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowRemove(false);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeIdea();
                    }}>
                    是否删除知识点&nbsp;{props.idea.basic_info.title}?
                </Modal>
            )}
            {showEditPermModal == true && (
                <EditPermModal ideaId={props.idea.idea_id} ideaPerm={props.idea.idea_perm} onClose={() => setShowEditPermModal(false)} />
            )}
        </div>
    );
};

export default observer(IdeaContent);