import React, { useState } from "react";
import type { IdeaInStore } from "@/api/idea_store";
import { useCommonEditor } from "@/components/Editor";
import { FILE_OWNER_TYPE_NONE } from "@/api/fs";
import { Form, Input, Modal, Select } from "antd";
import { update_idea } from "@/api/idea_store_admin";
import { request } from "@/utils/request";
import { get_admin_session } from "@/api/admin_auth";


export interface UpdateIdeaModalProps {
    idea: IdeaInStore;
    onCancel: () => void;
    onOk: () => void;
}

const UpdateIdeaModal = (props: UpdateIdeaModalProps) => {
    const [title, setTitle] = useState(props.idea.basic_info.title);
    const [keywordList, setKeywordList] = useState(props.idea.basic_info.keyword_list);

    const { editor, editorRef } = useCommonEditor({
        content: props.idea.basic_info.content,
        fsId: "",
        ownerType: FILE_OWNER_TYPE_NONE,
        ownerId: "",
        projectId: "",
        historyInToolbar: false,
        clipboardInToolbar: false,
        commonInToolbar: true,
        widgetInToolbar: false,
        showReminder: false,
    });

    const updateIdea = async () => {
        if (title.trim() == "") {
            return;
        }
        const content = editorRef.current?.getContent() ?? {
            type: 'doc',
        };
        const sessionId = await get_admin_session();
        await request(update_idea({
            admin_session_id: sessionId,
            idea_id: props.idea.idea_id,
            basic_info: {
                title: title.trim(),
                content: JSON.stringify(content),
                keyword_list: keywordList,
            },
        }));
        props.onOk();
    };

    return (
        <Modal open title="更新知识点"
            okText="更新" okButtonProps={{ disabled: (keywordList.length == 0 || title.trim() == "") }}
            width={800}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                updateIdea();
            }}>
            <Form labelCol={{ span: 3 }}>
                <Form.Item label="标题">
                    <Input value={title} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setTitle(e.target.value.trim());
                    }} />
                </Form.Item>
                <Form.Item label="内容">
                    <div className="_editChatContext">
                        {editor}
                    </div>
                </Form.Item>
                <Form.Item label="关键词">
                    <Select mode="tags" value={keywordList} onChange={value => setKeywordList((value as string[]).map(item => item.toLowerCase()))}
                        placement="topLeft" placeholder="请设置知识点相关的关键词" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UpdateIdeaModal;