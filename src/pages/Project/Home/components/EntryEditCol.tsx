import React, { useState } from "react";
import { observer } from 'mobx-react';
import { type EntryInfo } from "@/api/project_entry";
import { Button, Popover, Space } from "antd";
import { useStores } from "@/hooks";
import { EditOutlined, MoreOutlined } from "@ant-design/icons";
import RemoveEntryModal from "./RemoveEntryModal";

export interface EntryOptColProps {
    entryInfo: EntryInfo;
}

const EntryEditCol = (props: EntryOptColProps) => {
    const entryStore = useStores('entryStore');

    const [showRemoveModal, setShowRemoveModal] = useState(false);

    return (
        <Space>
            <Button type="link" disabled={!props.entryInfo.can_update} style={{ minWidth: 0, padding: "0px" }}
                onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    entryStore.editEntryId = props.entryInfo.entry_id;
                }} icon={<EditOutlined />} />
            <Popover trigger="click" placement="bottom" content={
                <div style={{ padding: "10px 10px" }}>
                    <Button type="link" danger disabled={!props.entryInfo.can_remove}
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setShowRemoveModal(true);
                        }}>移至回收站</Button>
                </div>
            }>
                <MoreOutlined />
            </Popover>

            {showRemoveModal == true && (
                <RemoveEntryModal entryInfo={props.entryInfo} onCancel={() => setShowRemoveModal(false)}
                    onRemove={() => {
                        setShowRemoveModal(false);
                    }} />
            )}
        </Space>
    );
};

export default observer(EntryEditCol);