//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useState } from 'react';
import { joinOrgOrProject } from '@/components/LeftMenu/join';
import { Form, Input, Modal } from 'antd';
import { observer } from 'mobx-react';
import { useHistory } from 'react-router-dom';
import { useStores } from '@/hooks';


interface JoinModalProps {
    onClose: () => void;
}

const JoinModal = (props: JoinModalProps) => {
    const history = useHistory();

    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const orgStore = useStores('orgStore');

    const [linkText, setLinkText] = useState('');

    const runJoin = async () => {
        await joinOrgOrProject(linkText, userStore, projectStore, orgStore, history);
        props.onClose();
    };

    return (
        <Modal open title="加入项目/团队"
            okText="加入" okButtonProps={{ disabled: linkText == "" }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onClose();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                runJoin();
            }}>
            <Form labelCol={{ span: 3 }} style={{ paddingRight: "20px" }}>
                <Form.Item label="邀请码">
                    <Input
                        placeholder="请输入邀请码"
                        allowClear
                        onChange={(e) => setLinkText(e.target.value.trim())}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default observer(JoinModal);