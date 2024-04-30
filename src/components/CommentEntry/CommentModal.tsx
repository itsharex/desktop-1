//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React from "react";
import type { COMMENT_TARGET_TYPE } from "@/api/project_comment";
import { Modal } from "antd";
import CommentInModal from "./CommentInModal";

export interface CommentModalProps {
    projectId: string;
    targetType: COMMENT_TARGET_TYPE;
    targetId: string;
    myUserId: string;
    myAdmin: boolean;
    onCancel: () => void;
}

const CommentModal = (props: CommentModalProps) => {
    return (
        <Modal open title="评论" footer={null}
            width={800} bodyStyle={{ maxHeight: "calc(100vh - 250px)", overflowY: "scroll" }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}>
            <CommentInModal projectId={props.projectId} targetType={props.targetType} targetId={props.targetId}
                myUserId={props.myUserId} myAdmin={props.myAdmin} />
        </Modal>
    );
};

export default CommentModal;