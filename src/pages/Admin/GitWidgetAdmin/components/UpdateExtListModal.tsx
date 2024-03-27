import React, { useState } from "react";
import type { WidgetInfo } from "@/api/widget";
import { Input, Modal } from "antd";
import { update_widget } from "@/api/widget_admin";
import { get_admin_session } from "@/api/admin_auth";
import { request } from "@/utils/request";

export interface UpdateExtListModalProps {
    widgetInfo: WidgetInfo;
    onCancel: () => void;
    onOk: () => void;
}

const UpdateExtListModal = (props: UpdateExtListModalProps) => {
    const [extListValue, setExtListValue] = useState(props.widgetInfo.extension_list.join("\n"));

    const updateWidget = async () => {
        const sessionId = await get_admin_session();
        await request(update_widget({
            admin_session_id: sessionId,
            widget_id: props.widgetInfo.widget_id,
            widget_name: props.widgetInfo.widget_name,
            extension_list: extListValue.split("\n").map(item => item.trim()).filter(item => item.length > 0),
            file_list: props.widgetInfo.file_list,
        }));
        props.onOk();
    };

    return (
        <Modal open title="更新文件扩展匹配"
            okText="更新"
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                updateWidget();
            }}>
            <Input.TextArea autoSize={{ minRows: 10, maxRows: 10 }} value={extListValue} onChange={e => {
                e.stopPropagation();
                e.preventDefault();
                setExtListValue(e.target.value);
            }} />
        </Modal>
    )
};

export default UpdateExtListModal;