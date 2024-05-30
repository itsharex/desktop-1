//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { fetch } from '@tauri-apps/api/http';
import { JihulabUser } from './common';

export interface JihulabIssue {
    id: number;
    state: string;
    title: string;
    created_at: string;
    updated_at: string;
    closed_at: string;
    web_url: string;
    author: JihulabUser;
    assignee: JihulabUser;
}

// {
//     "id": 215120,
//     "iid": 1,
//     "project_id": 51278,
//     "title": "gitlab事件显示为TODO",
//     "description": "",
//     "state": "closed",
//     "created_at": "2022-10-01T10:30:02.598+08:00",
//     "updated_at": "2022-10-22T09:56:11.850+08:00",
//     "closed_at": "2022-10-22T09:56:11.825+08:00",
//     "closed_by": {
//         "id": 16536,
//         "username": "user_linksaas",
//         "name": "鲨 凌",
//         "state": "active",
//         "locked": false,
//         "avatar_url": "https://jihulab.com/uploads/-/system/user/avatar/16536/avatar.png",
//         "web_url": "https://jihulab.com/user_linksaas"
//     },
//     "labels": [],
//     "milestone": null,
//     "assignees": [
//         {
//             "id": 16536,
//             "username": "user_linksaas",
//             "name": "鲨 凌",
//             "state": "active",
//             "locked": false,
//             "avatar_url": "https://jihulab.com/uploads/-/system/user/avatar/16536/avatar.png",
//             "web_url": "https://jihulab.com/user_linksaas"
//         }
//     ],
//     "author": {
//         "id": 16536,
//         "username": "user_linksaas",
//         "name": "鲨 凌",
//         "state": "active",
//         "locked": false,
//         "avatar_url": "https://jihulab.com/uploads/-/system/user/avatar/16536/avatar.png",
//         "web_url": "https://jihulab.com/user_linksaas"
//     },
//     "type": "ISSUE",
//     "assignee": {
//         "id": 16536,
//         "username": "user_linksaas",
//         "name": "鲨 凌",
//         "state": "active",
//         "locked": false,
//         "avatar_url": "https://jihulab.com/uploads/-/system/user/avatar/16536/avatar.png",
//         "web_url": "https://jihulab.com/user_linksaas"
//     },
//     "user_notes_count": 0,
//     "merge_requests_count": 0,
//     "upvotes": 0,
//     "downvotes": 0,
//     "due_date": null,
//     "confidential": false,
//     "discussion_locked": null,
//     "issue_type": "issue",
//     "web_url": "https://jihulab.com/linksaas/desktop/-/issues/1",
//     "time_stats": {
//         "time_estimate": 0,
//         "total_time_spent": 0,
//         "human_time_estimate": null,
//         "human_total_time_spent": null
//     },
//     "task_completion_status": {
//         "count": 0,
//         "completed_count": 0
//     },
//     "weight": null,
//     "blocking_issues_count": 0,
//     "has_tasks": true,
//     "task_status": "",
//     "_links": {
//         "self": "https://jihulab.com/api/v4/projects/51278/issues/1",
//         "notes": "https://jihulab.com/api/v4/projects/51278/issues/1/notes",
//         "award_emoji": "https://jihulab.com/api/v4/projects/51278/issues/1/award_emoji",
//         "project": "https://jihulab.com/api/v4/projects/51278",
//         "closed_as_duplicate_of": null
//     },
//     "references": {
//         "short": "#1",
//         "relative": "#1",
//         "full": "linksaas/desktop#1"
//     },
//     "severity": "UNKNOWN",
//     "moved_to_id": null,
//     "imported": false,
//     "imported_from": "none",
//     "service_desk_reply_to": null,
//     "epic_iid": null,
//     "epic": null,
//     "iteration": null
// }

export async function list_issue(accessToken: string, repoId: number): Promise<JihulabIssue[]> {
    const url = `https://jihulab.com/api/v4/projects/${repoId}/issues?access_token=${accessToken}&scope=all&state=all`;
    console.log(url);
    const res = await fetch<JihulabIssue[]>(url, {
        method: "GET",
        timeout: 10,
    });
    console.log(res.data);
    if (res.ok && res.status == 200) {
        return res.data;
    } else {
        console.log(res);
        throw "error list issue";
    }
}