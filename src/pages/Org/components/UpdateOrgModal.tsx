import React, { useState } from "react";
import type { OrgInfo } from "@/api/org";
import { update_org } from "@/api/org";
import { Form, Input, message, Modal } from "antd";
import { useCommonEditor } from "@/components/Editor";
import { FILE_OWNER_TYPE_NONE } from "@/api/fs";
import { useStores } from "@/hooks";
import { request } from "@/utils/request";

export interface UpdateOrgModalProps {
    orgInfo: OrgInfo;
    onClose: () => void;
}

const UpdateOrgModal = (props: UpdateOrgModalProps) => {
    const userStore = useStores('userStore');
    const orgStore = useStores('orgStore');

    const [orgName, setOrgName] = useState(props.orgInfo.basic_info.org_name);

    const { editor, editorRef } = useCommonEditor({
        placeholder: "请输入团队介绍",
        content: props.orgInfo.basic_info.org_desc,
        fsId: "",
        ownerType: FILE_OWNER_TYPE_NONE,
        ownerId: "",
        projectId: "",
        historyInToolbar: false,
        clipboardInToolbar: false,
        commonInToolbar: false,
        widgetInToolbar: false,
        showReminder: false,
    });

    const updateOrg = async () => {
        const content = editorRef.current?.getContent() ?? { type: "doc" };
        await request(update_org({
            session_id: userStore.sessionId,
            org_id: props.orgInfo.org_id,
            basic_info: {
                org_name:orgName,
                org_desc: JSON.stringify(content),
            },
        }));
        await orgStore.initLoadOrgList();
        props.onClose();
        message.info("修改成功");
    };

    return (
        <Modal open title="修改团队信息"
            okText="修改" okButtonProps={{ disabled: orgName == "" }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onClose();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                updateOrg();
            }}>
            <Form labelCol={{ span: 3 }} style={{ paddingRight: "20px" }}>
                <Form.Item label="团队名称">
                    <Input allowClear placeholder={`请输入团队名称`} style={{ borderRadius: '6px' }} value={orgName} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setOrgName(e.target.value.trim());
                    }} />
                </Form.Item>
                <Form.Item label="团队介绍">
                    <div className="_projectEditContext" style={{ marginTop: '-12px' }}>
                        {editor}
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UpdateOrgModal;