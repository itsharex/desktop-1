//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useState } from "react";
import { observer } from 'mobx-react';
import { Checkbox, Form, Modal, Select, Space, message } from "antd";
import type { IdeaPerm } from "@/api/project_idea";
import { update_idea_perm } from "@/api/project_idea";
import { useStores } from "@/hooks";
import UserPhoto from "@/components/Portrait/UserPhoto";
import { request } from "@/utils/request";

export interface EditPermModalProps {
    ideaId: string;
    ideaPerm: IdeaPerm;
    onClose: () => void;
}

const EditPermModal = (props: EditPermModalProps) => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const memberStore = useStores('memberStore');

    const [updateForAll, setUpdateForAll] = useState(props.ideaPerm.update_for_all);
    const [extraUserIdList, setExtraUserIdList] = useState(props.ideaPerm.extra_update_user_id_list);

    const updatePerm = async () => {
        await request(update_idea_perm({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            idea_id: props.ideaId,
            idea_perm: {
                update_for_all: updateForAll,
                extra_update_user_id_list: extraUserIdList,
            },
        }));
        message.info("更新权限成功");
        props.onClose();
    };

    return (
        <Modal open title="修改知识点权限"
            okText="修改"
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onClose();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                updatePerm();
            }}>
            <Form labelCol={{ span: 5 }}>
                <Form.Item label="全体成员可编辑">
                    <Checkbox checked={updateForAll} onChange={e => {
                        e.stopPropagation();
                        setUpdateForAll(e.target.checked);
                        if (e.target.checked) {
                            setExtraUserIdList([]);
                        }
                    }} />
                </Form.Item>
                {updateForAll == false && (
                    <Form.Item label="可编辑成员" help="管理员始终有编辑权限">
                        <Select value={extraUserIdList} onChange={value => {
                            setExtraUserIdList(value);
                        }} mode="multiple">
                            {memberStore.memberList.filter(member => member.member.can_admin == false).map(member => (
                                <Select.Option key={member.member.member_user_id} value={member.member.member_user_id}>
                                    <Space>
                                        <UserPhoto logoUri={member.member.logo_uri} style={{ width: "16px", borderRadius: "10px" }} />
                                        {member.member.display_name}
                                    </Space>
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}
            </Form>
        </Modal>
    );
};

export default observer(EditPermModal);