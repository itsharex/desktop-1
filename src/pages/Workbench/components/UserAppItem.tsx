import React, { useState } from "react";
import { observer } from 'mobx-react';
import { remove as remove_app } from "@/api/user_app";
import { Button, Card, Popover, Modal, message, Space } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import defaultIcon from '@/assets/allIcon/app-default-icon.png';
import { useStores } from "@/hooks";
import { GLOBAL_APPSTORE_FS_ID } from '@/api/fs';
import StoreStatusModal from "@/components/MinApp/StoreStatusModal";
import AsyncImage from "@/components/AsyncImage";
import type { AppInfo } from "@/api/appstore";

interface UserAppItemProps {
    appInfo: AppInfo;
    onRemove: () => void;
}


const UserAppItem: React.FC<UserAppItemProps> = (props) => {
    const appStore = useStores("appStore");

    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [showStoreStatusModal, setShowStoreStatusModal] = useState(false);

    const getIconUrl = (fileId: string) => {
        if (fileId == "") {
            return "";
        }
        if (appStore.isOsWindows) {
            return `https://fs.localhost/${GLOBAL_APPSTORE_FS_ID}/${fileId}/icon.png`;
        } else {
            return `fs://localhost/${GLOBAL_APPSTORE_FS_ID}/${fileId}/icon.png`;
        }
    };

    const removeApp = async () => {
        await remove_app(props.appInfo.app_id);
        setShowRemoveModal(false);
        message.info("卸载应用成功");
        props.onRemove();
    }

    return (
        <Card title={props.appInfo.base_info.app_name} bordered={false} extra={
            <Popover content={
                <Space direction="vertical" style={{ padding: "10px 10px" }}>
                    <Button type="link" onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowStoreStatusModal(true);
                    }}>存储统计</Button>
                    <Button type="link" danger onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowRemoveModal(true);
                    }}>卸载</Button>
                </Space>
            }
                trigger="click" placement="bottom">
                <MoreOutlined />
            </Popover>
        }>
            <AsyncImage
                style={{ width: "80px", cursor: "pointer" }}
                src={getIconUrl(props.appInfo.base_info.icon_file_id)}
                preview={false}
                fallback={defaultIcon}
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    appStore.openMinAppId = props.appInfo.app_id;
                }}
                useRawImg={false}
            />
            {showRemoveModal == true && (
                <Modal open title="卸载应用"
                    okButtonProps={{ danger: true }}
                    okText="卸载应用"
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowRemoveModal(false);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeApp();
                    }}>
                    是否卸载应用&nbsp;{props.appInfo.base_info.app_name}&nbsp;?
                </Modal>
            )}
            {showStoreStatusModal == true && (
                <StoreStatusModal minAppId={props.appInfo.app_id} onCancel={() => { setShowStoreStatusModal(false) }} />
            )}
        </Card>
    );
};

export default observer(UserAppItem);