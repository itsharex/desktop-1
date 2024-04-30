//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React from "react";
import { issueState, ISSUE_STATE_COLOR_ENUM } from '@/utils/constant';
import type { IssueInfo } from '@/api/project_issue';
import { ISSUE_STATE_PLAN, ISSUE_STATE_PROCESS, ISSUE_STATE_CHECK, ISSUE_STATE_CLOSE } from '@/api/project_issue';
import { LinkOutlined } from "@ant-design/icons";


export const renderTitle = (row: IssueInfo, inModal: boolean, onClick: () => void) => {
    return (
        <>
            {inModal == true && (
                <span title={row.basic_info?.title ?? ""}>{row.basic_info?.title ?? ""}</span>
            )}
            {inModal == false && (
                <a onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    onClick();
                }} title={row.basic_info?.title ?? ""}><LinkOutlined />&nbsp;{row.basic_info?.title ?? ""}</a>
            )}
        </>
    );
};

const getColor = (v: number) => {
    switch (v) {
        case ISSUE_STATE_PLAN:
            return ISSUE_STATE_COLOR_ENUM.规划中颜色;
        case ISSUE_STATE_PROCESS:
            return ISSUE_STATE_COLOR_ENUM.处理颜色;
        case ISSUE_STATE_CHECK:
            return ISSUE_STATE_COLOR_ENUM.验收颜色;
        case ISSUE_STATE_CLOSE:
            return ISSUE_STATE_COLOR_ENUM.关闭颜色;
        default:
            return ISSUE_STATE_COLOR_ENUM.规划中颜色;
    }
};

export const renderState = (val: number) => {
    const v = issueState[val];
    return (
        <div
            style={{
                background: `rgb(${getColor(val)} / 20%)`,
                width: '50px',
                margin: '0 auto',
                borderRadius: '50px',
                textAlign: 'center',
                color: `rgb(${getColor(val)})`,
            }}
        >
            {v.label}
        </div>
    );
};