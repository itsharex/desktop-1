//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { check_un_read, type COMMENT_TARGET_TYPE } from "@/api/project_comment";
import { request } from "@/utils/request";
import { Badge } from "antd";
import { useStores } from "@/hooks";

export interface CommentTabProps {
    targetType: COMMENT_TARGET_TYPE;
    targetId: string;
    dataVersion: number;
}

const CommentTab = (props: CommentTabProps) => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');

    const [hasUnRead, setHasUnRead] = useState(false);

    const checkHasUnread = async () => {
        const res = await request(check_un_read({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            target_type: props.targetType,
            target_id: props.targetId,
        }));
        setHasUnRead(res.has_un_read);
    };

    useEffect(() => {
        checkHasUnread();
    }, [props.targetId, props.dataVersion]);

    return (
        <Badge count={hasUnRead ? 1 : 0} dot={true}>
            评论&nbsp;&nbsp;
        </Badge>
    );
}

export default observer(CommentTab);