//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useState } from "react";
import { Checkbox, Form, Input, InputNumber, message, Modal } from "antd";
import { get_admin_session } from '@/api/admin_auth';
import { OS_LINUX, OS_MAC, OS_WINDOWS, type OS_TYPE } from "@/api/sw_store";
import { request } from "@/utils/request";
import { add_soft_ware } from "@/api/sw_store_admin";
import { useCommonEditor } from "@/components/Editor";
import s from "./AddSoftWareModal.module.less";
import AsyncImage from "@/components/AsyncImage";
import defaultIcon from '@/assets/allIcon/app-default-icon.png';
import { open as open_dialog } from '@tauri-apps/api/dialog';
import { write_file, set_file_owner, GLOBAL_SOFT_WARE_STORE_FS_ID, FILE_OWNER_TYPE_SOFT_WARE_STORE } from "@/api/fs";

export interface AddSoftWareModalProps {
    cateId: string;
    onCancel: () => void;
    onOk: () => void;
}

const AddSoftWareModal = (props: AddSoftWareModalProps) => {
    const [name, setName] = useState("");
    const [weight, setWeight] = useState(0);
    const [recommend, setRecommend] = useState(false);
    const [osList, setOsList] = useState<OS_TYPE[]>([]);
    const [downloadUrl, setDownloadUrl] = useState("");
    const [iconFileId, setIconFileId] = useState("");

    const { editor, editorRef } = useCommonEditor({
        content: "",
        fsId: "",
        ownerType: 0,
        ownerId: "",
        projectId: "",
        historyInToolbar: false,
        clipboardInToolbar: false,
        commonInToolbar: true,
        widgetInToolbar: false,
        showReminder: false,
    });


    const changeIcon = async () => {
        const selectd = await open_dialog({
            title: "更换应用图标",
            filters: [{
                name: "图标",
                extensions: ["ico", "png", "jpg", "jpeg"],
            }],
        });
        if (selectd == null || Array.isArray(selectd)) {
            return;
        } else {
            const sessionId = await get_admin_session();
            const res = await request(write_file(sessionId, GLOBAL_SOFT_WARE_STORE_FS_ID, selectd, ""));
            setIconFileId(res.file_id);
        }
    };

    const addSoftWare = async () => {
        const sessionId = await get_admin_session();
        const content = editorRef.current?.getContent() ?? { type: 'doc' };
        const addRes = await request(add_soft_ware({
            admin_session_id: sessionId,
            sw_name: name,
            sw_desc: JSON.stringify(content),
            cate_id: props.cateId,
            weight: weight,
            recommend: recommend,
            os_list: osList,
            download_url: downloadUrl,
            icon_file_id: iconFileId,
        }));
        if (iconFileId != "") {
            await set_file_owner({
                session_id: sessionId,
                fs_id: GLOBAL_SOFT_WARE_STORE_FS_ID,
                file_id: iconFileId,
                owner_type: FILE_OWNER_TYPE_SOFT_WARE_STORE,
                owner_id: addRes.sw_id,
            });
        }
        message.info("添加成功");
        props.onOk();
    };

    return (
        <Modal open title="添加软件"
            okText="添加" okButtonProps={{ disabled: !(iconFileId != "" && name != "" && osList.length > 0 && downloadUrl.startsWith("https://")) }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e=>{
                e.stopPropagation();
                e.preventDefault();
                addSoftWare();
            }}>
            <div className={s.head}>
                <div className={s.left}>
                    <AsyncImage style={{ width: "80px", cursor: "pointer" }}
                        src={`fs://localhost/${GLOBAL_SOFT_WARE_STORE_FS_ID}/${iconFileId}/icon.png`}
                        preview={false}
                        fallback={defaultIcon}
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            changeIcon();
                        }}
                        useRawImg={false}
                    />
                </div>
                <div className={s.right}>
                    <Form labelCol={{ span: 4 }}>
                        <Form.Item label="名称">
                            <Input value={name} onChange={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setName(e.target.value.trim());
                            }} />
                        </Form.Item>
                        <Form.Item label="权重">
                            <InputNumber value={weight} controls={false} precision={0} min={0} max={99}
                                onChange={value => {
                                    if (value != null) {
                                        setWeight(value);
                                    }
                                }} />
                        </Form.Item>
                        <Form.Item label="推荐软件">
                            <Checkbox checked={recommend} onChange={e => {
                                e.stopPropagation();
                                setRecommend(e.target.checked);
                            }} />
                        </Form.Item>
                        <Form.Item label="操作系统">
                            <Checkbox.Group options={[
                                {
                                    label: "windows",
                                    value: OS_WINDOWS,
                                },
                                {
                                    label: "mac",
                                    value: OS_MAC,
                                },
                                {
                                    label: "linux",
                                    value: OS_LINUX,
                                }
                            ]} value={osList} onChange={values => setOsList(values as number[])} />
                        </Form.Item>
                        <Form.Item label="下载地址" help={
                            <>
                                {downloadUrl != "" && downloadUrl.startsWith("https://".substring(0, downloadUrl.length)) == false && (
                                    <span style={{ color: "red" }}>必须以https://开头</span>
                                )}
                            </>
                        }>
                            <Input value={downloadUrl} onChange={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setDownloadUrl(e.target.value.trim());
                            }} />
                        </Form.Item>
                    </Form>
                </div>
            </div>
            <div className="_projectEditContext">
                {editor}
            </div>
        </Modal>
    );
};

export default AddSoftWareModal;