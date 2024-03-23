import React, { useState } from "react";
import type { OrgInfo } from "@/api/org";
import { remove_org } from "@/api/org";
import { observer } from 'mobx-react';
import { Input, message, Modal } from "antd";
import { useStores } from "@/hooks";
import { useHistory } from "react-router-dom";
import { request } from "@/utils/request";

export interface RemoveOrgModalProps {
    orgInfo: OrgInfo;
    onClose: () => void;
}

const RemoveOrgModal = (props: RemoveOrgModalProps) => {
    const history = useHistory();

    const userStore = useStores('userStore');
    const orgStore = useStores('orgStore');

    const [name, setName] = useState("");

    const removeOrg = async () => {
        await request(remove_org({
            session_id: userStore.sessionId,
            org_id: props.orgInfo.org_id,
        }));
        orgStore.onLeave(props.orgInfo.org_id, userStore.userInfo.userId, history);
        props.onClose();
        message.info("删除团队成功");
    };

    return (
        <Modal open title={`删除团队 ${props.orgInfo.basic_info.org_name}`}
            okText="删除" okButtonProps={{ danger: true, disabled: name != props.orgInfo.basic_info.org_name }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onClose();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                removeOrg();
            }}>
            <p style={{ color: "red" }}>删除团队后，团队内的所有数据均不可访问</p>
            <Input placeholder="请输入要删除的项目名称" value={name} onChange={e => {
                e.stopPropagation();
                e.preventDefault();
                setName(e.target.value.trim());
            }} />
        </Modal>
    );
};

export default observer(RemoveOrgModal);