//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { useStores } from '@/hooks';
import { Form, Input, message, Modal } from 'antd';
import React, { useState } from 'react';
import { observer } from 'mobx-react';
import { update as update_user } from '@/api/user';
import { request } from '@/utils/request';


export interface UpdateDisplayNameModalProps {
    onClose: () => void;
}

const UpdateDisplayNameModal = (props: UpdateDisplayNameModalProps) => {
    const userStore = useStores('userStore');

    const [displayName, setDisplayName] = useState(userStore.userInfo.displayName);

    const updateDisplayName = async () => {
        if (displayName == "") {
            return;
        }
        await request(update_user(userStore.sessionId, {
            display_name: displayName,
            logo_uri: userStore.userInfo.logoUri,
        }));
        userStore.updateDisplayName(displayName);
        message.info("修改成功");
        props.onClose();
    };

    return (
        <Modal open title="修改昵称"
            okText="修改" okButtonProps={{ disabled: !(displayName != "" && displayName != userStore.userInfo.displayName) }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onClose();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                updateDisplayName();
            }}>
            <Form>
                <Form.Item label="昵称">
                    <Input value={displayName} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setDisplayName(e.target.value);
                    }} />
                </Form.Item>
            </Form>
        </Modal>
    )
};

export default observer(UpdateDisplayNameModal);