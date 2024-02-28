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
        message.info("删除成功");
    };

    return (
        <Modal open title={`删除${getEntryTypeStr(props.entryInfo.entry_type)}`}
            okText="删除" okButtonProps={{ danger: true }}
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
                是否删除&nbsp;{getEntryTypeStr(props.entryInfo.entry_type)}&nbsp;{props.entryInfo.entry_title}&nbsp;?
            </p>
            <p style={{ color: "red" }}>
                删除后数据将不可恢复!!!
            </p>
        </Modal>
    );
};

export default observer(RemoveEntryModal);