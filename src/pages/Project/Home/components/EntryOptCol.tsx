import React, { useState } from "react";
import { observer } from 'mobx-react';
import { type EntryInfo } from "@/api/project_entry";
import { Button, Popover, Space } from "antd";
import { useStores } from "@/hooks";
import { MoreOutlined } from "@ant-design/icons";
import RemoveEntryModal from "./RemoveEntryModal";

export interface EntryOptColProps {
    entryInfo: EntryInfo;
}

const EntryOptCol = (props: EntryOptColProps) => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const entryStore = useStores('entryStore');

    const [showRemoveModal, setShowRemoveModal] = useState(false);

    return (
        <>

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
                                setShowRemoveModal(true);
                            }}>移至回收站</Button>
                    </div>
                }>
                    <MoreOutlined />
                </Popover>
            </Space>


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