import React, { useState } from "react";
import { observer } from 'mobx-react';
import { update_mark_remove, type EntryInfo } from "@/api/project_entry";
import { Button, Modal, Popover, Space, message } from "antd";
import { useStores } from "@/hooks";
import { MoreOutlined } from "@ant-design/icons";
import RemoveEntryModal from "./RemoveEntryModal";
import { request } from "@/utils/request";

export interface EntryOptColProps {
    entryInfo: EntryInfo;
}

const EntryOptCol = (props: EntryOptColProps) => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const entryStore = useStores('entryStore');

    const [showCloseModal, setShowCloseModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);

    const setRemoveMark = async (value: boolean) => {
        await request(update_mark_remove({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            entry_id: props.entryInfo.entry_id,
            mark_remove: value,
        }));
        entryStore.incDataVersion();
    };

    return (
        <>
            {props.entryInfo.mark_remove == false && (
                <Space>
                    <Button type="link" disabled={!props.entryInfo.can_update} style={{ minWidth: 0, padding: "0px" }}
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            entryStore.editEntryId = props.entryInfo.entry_id;
                        }}>修改</Button>
                    <Popover trigger="click" placement="bottom" content={
                        <div style={{ padding: "10px" }}>
                            <Button type="link" danger disabled={!(projectStore.isAdmin || userStore.userInfo.userId == props.entryInfo.create_user_id)}
                                onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setShowCloseModal(true);
                                }}>移至回收站</Button>
                        </div>
                    }>
                        <MoreOutlined />
                    </Popover>
                </Space>
            )}
            {props.entryInfo.mark_remove == true && (
                <Space>
                    <Button type="link" style={{ minWidth: 0, padding: "0px 0px" }}
                        disabled={!(projectStore.isAdmin || (props.entryInfo.create_user_id == userStore.userInfo.userId))}
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setRemoveMark(false).then(() => {
                                message.info("恢复成功");
                            });
                        }}>恢复</Button>
                    <Popover trigger="click" placement="bottom" content={
                        <div style={{ padding: "10px" }}>
                            <Button type="link" danger disabled={!(projectStore.isAdmin || userStore.userInfo.userId == props.entryInfo.create_user_id)}
                                onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setShowRemoveModal(true);
                                }}>删除</Button>
                        </div>
                    }>
                        <MoreOutlined />
                    </Popover>
                </Space>

            )}
            {showCloseModal == true && (
                <Modal open title={`移至回收站`}
                    mask={false}
                    okText="移动"
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowCloseModal(false);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setRemoveMark(true).then(() => {
                            setShowCloseModal(false);
                            message.info("移至回收站成功");
                        });
                    }}>
                    <p>移动内容入口&nbsp;{props.entryInfo.entry_title}&nbsp;至回收站。</p>
                    <p>移至回收站后可以在回收站列表下找到。</p>
                </Modal>
            )}
            {showRemoveModal == true && (
                <RemoveEntryModal entryInfo={props.entryInfo} onRemove={() => {
                    entryStore.incDataVersion();
                    setShowRemoveModal(false);
                }} onCancel={() => setShowRemoveModal(false)} />
            )}
        </>
    );
};

export default observer(EntryOptCol);