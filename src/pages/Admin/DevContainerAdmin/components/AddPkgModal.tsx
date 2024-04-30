//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { Form, Input, Modal, message } from "antd";
import React, { useState } from "react";
import { get_admin_session } from '@/api/admin_auth';
import { request } from "@/utils/request";
import { add_package } from "@/api/dev_container_admin";



export interface AddPkgModalProps {
    onCancel: () => void;
    onOk: (pkgName: string) => void;
}


const AddPkgModal = (props: AddPkgModalProps) => {
    const [pkgName, setPkgName] = useState("");
    const [pluginUrl, setPluginUrl] = useState("");

    const addPkg = async () => {
        const sessionId = await get_admin_session();
        await request(add_package({
            admin_session_id: sessionId,
            package_name: pkgName,
            plugin_url: pluginUrl,
        }));
        message.info(`增加软件包${pkgName}成功`);
        props.onOk(pkgName);
    };

    return (
        <Modal open title="增加软件包"
            okText="增加" okButtonProps={{ disabled: pkgName == "" || pluginUrl == "" }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                addPkg();
            }}>
            <Form labelCol={{ span: 4 }}>
                <Form.Item label="软件包名称">
                    <Input value={pkgName} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setPkgName(e.target.value.trim());
                    }} />
                </Form.Item>
                <Form.Item label="插件地址">
                    <Input value={pluginUrl} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setPluginUrl(e.target.value.trim());
                    }} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddPkgModal;