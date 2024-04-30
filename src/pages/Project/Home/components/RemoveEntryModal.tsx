//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React from "react";
import { observer } from 'mobx-react';
import { type EntryInfo, remove as remove_entry } from "@/api/project_entry";
import { Modal, message } from "antd";
import { getEntryTypeStr } from "./common";
import { useStores } from "@/hooks";
import { request } from "@/utils/request";


export interface RemoveEntryModalProps {
    entryInfo: EntryInfo;
    onRemove: () => void;
    onCancel: () => void;
}

const RemoveEntryModal = (props: RemoveEntryModalProps) => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const entryStore = useStores('entryStore');

    const removeEntry = async () => {
        await request(remove_entry({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            entry_id: props.entryInfo.entry_id,
        }));
        if (entryStore.curEntry != null && entryStore.curEntry.entry_id == props.entryInfo.entry_id) {
            entryStore.curEntry = null;
        }
        props.onRemove();
        message.info("移至回收站成功");
    };

    return (
        <Modal open title="移至回收站"
            okText="移至" okButtonProps={{ danger: true }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                removeEntry();
            }}>
            <p>
                是否把&nbsp;{getEntryTypeStr(props.entryInfo.entry_type)}&nbsp;{props.entryInfo.entry_title}&nbsp;移至回收站?
            </p>
            
        </Modal>
    );
};

export default observer(RemoveEntryModal);