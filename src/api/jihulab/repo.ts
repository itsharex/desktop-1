//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { fetch } from '@tauri-apps/api/http';

export interface JihulabRepo {
    id: number;
    description: string;
    name: string;
    path: string;
    path_with_namespace: string;
    web_url: string;
    ssh_url_to_repo: string;
    http_url_to_repo: string;
    default_branch: string;
    visibility: string;
    issues_enabled: boolean;
    wiki_enabled: boolean;
}

// {
//     "id": 93853,
//     "description": null,
//     "name": "tauri",
//     "name_with_namespace": "linksaas / tauri",
//     "path": "tauri",
//     "path_with_namespace": "linksaas/tauri",
//     "created_at": "2023-02-20T12:53:55.512+08:00",
//     "default_branch": "local_ipc",
//     "tag_list": [],
//     "topics": [],
//     "ssh_url_to_repo": "git@jihulab.com:linksaas/tauri.git",
//     "http_url_to_repo": "https://jihulab.com/linksaas/tauri.git",
//     "web_url": "https://jihulab.com/linksaas/tauri",
//     "readme_url": "https://jihulab.com/linksaas/tauri/-/blob/local_ipc/README.md",
//     "forks_count": 0,
//     "avatar_url": null,
//     "star_count": 0,
//     "last_activity_at": "2024-03-14T11:18:59.848+08:00",
//     "namespace": {
//         "id": 74779,
//         "name": "linksaas",
//         "path": "linksaas",
//         "kind": "group",
//         "full_path": "linksaas",
//         "parent_id": null,
//         "avatar_url": "/uploads/-/system/group/avatar/74779/128x128_2x.png",
//         "web_url": "https://jihulab.com/groups/linksaas"
//     },
//     "container_registry_image_prefix": "registry.jihulab.com/linksaas/tauri",
//     "_links": {
//         "self": "https://jihulab.com/api/v4/projects/93853",
//         "issues": "https://jihulab.com/api/v4/projects/93853/issues",
//         "merge_requests": "https://jihulab.com/api/v4/projects/93853/merge_requests",
//         "repo_branches": "https://jihulab.com/api/v4/projects/93853/repository/branches",
//         "labels": "https://jihulab.com/api/v4/projects/93853/labels",
//         "events": "https://jihulab.com/api/v4/projects/93853/events",
//         "members": "https://jihulab.com/api/v4/projects/93853/members",
//         "cluster_agents": "https://jihulab.com/api/v4/projects/93853/cluster_agents"
//     },
//     "packages_enabled": true,
//     "empty_repo": false,
//     "archived": false,
//     "visibility": "public",
//     "resolve_outdated_diff_discussions": false,
//     "container_expiration_policy": {
//         "cadence": "1d",
//         "enabled": false,
//         "keep_n": 10,
//         "older_than": "90d",
//         "name_regex": ".*",
//         "name_regex_keep": null,
//         "next_run_at": "2023-02-21T12:53:55.553+08:00"
//     },
//     "repository_object_format": "sha1",
//     "issues_enabled": true,
//     "merge_requests_enabled": true,
//     "wiki_enabled": true,
//     "jobs_enabled": true,
//     "snippets_enabled": true,
//     "container_registry_enabled": true,
//     "service_desk_enabled": true,
//     "service_desk_address": "contact-project+linksaas-tauri-93853-issue-@mg.jihulab.com",
//     "can_create_merge_request_in": true,
//     "issues_access_level": "enabled",
//     "repository_access_level": "enabled",
//     "merge_requests_access_level": "enabled",
//     "forking_access_level": "enabled",
//     "wiki_access_level": "enabled",
//     "builds_access_level": "enabled",
//     "snippets_access_level": "enabled",
//     "pages_access_level": "private",
//     "analytics_access_level": "enabled",
//     "container_registry_access_level": "enabled",
//     "security_and_compliance_access_level": "private",
//     "releases_access_level": "enabled",
//     "environments_access_level": "enabled",
//     "feature_flags_access_level": "enabled",
//     "infrastructure_access_level": "enabled",
//     "monitor_access_level": "enabled",
//     "model_experiments_access_level": "enabled",
//     "model_registry_access_level": "enabled",
//     "emails_disabled": false,
//     "emails_enabled": true,
//     "shared_runners_enabled": true,
//     "lfs_enabled": true,
//     "creator_id": 16536,
//     "import_url": null,
//     "import_type": null,
//     "import_status": "none",
//     "open_issues_count": 0,
//     "description_html": "",
//     "updated_at": "2024-03-14T11:18:59.848+08:00",
//     "ci_default_git_depth": 20,
//     "ci_forward_deployment_enabled": true,
//     "ci_forward_deployment_rollback_allowed": true,
//     "ci_job_token_scope_enabled": false,
//     "ci_separated_caches": true,
//     "ci_allow_fork_pipelines_to_run_in_parent_project": true,
//     "build_git_strategy": "fetch",
//     "keep_latest_artifact": true,
//     "restrict_user_defined_variables": false,
//     "runners_token": null,
//     "runner_token_expiration_interval": null,
//     "group_runners_enabled": true,
//     "auto_cancel_pending_pipelines": "enabled",
//     "build_timeout": 3600,
//     "auto_devops_enabled": false,
//     "auto_devops_deploy_strategy": "continuous",
//     "ci_config_path": "",
//     "public_jobs": true,
//     "shared_with_groups": [],
//     "only_allow_merge_if_pipeline_succeeds": false,
//     "allow_merge_on_skipped_pipeline": null,
//     "request_access_enabled": true,
//     "only_allow_merge_if_all_discussions_are_resolved": false,
//     "remove_source_branch_after_merge": true,
//     "printing_merge_request_link_enabled": true,
//     "merge_method": "merge",
//     "squash_option": "default_off",
//     "enforce_auth_checks_on_uploads": true,
//     "suggestion_commit_message": null,
//     "merge_commit_template": null,
//     "squash_commit_template": null,
//     "issue_branch_template": null,
//     "warn_about_potentially_unwanted_characters": true,
//     "autoclose_referenced_issues": true,
//     "approvals_before_merge": 0,
//     "mirror": false,
//     "external_authorization_classification_label": null,
//     "marked_for_deletion_at": null,
//     "marked_for_deletion_on": null,
//     "requirements_enabled": false,
//     "requirements_access_level": "enabled",
//     "security_and_compliance_enabled": true,
//     "compliance_frameworks": [],
//     "issues_template": null,
//     "merge_requests_template": null,
//     "ci_restrict_pipeline_cancellation_role": "developer",
//     "merge_pipelines_enabled": false,
//     "merge_trains_enabled": false,
//     "merge_trains_skip_train_allowed": false,
//     "allow_pipeline_trigger_approve_deployment": false,
//     "permissions": {
//         "project_access": null,
//         "group_access": {
//             "access_level": 50,
//             "notification_level": 3
//         }
//     }
// }

export async function list_user_repo(accessToken: string): Promise<JihulabRepo[]> {
    const res = await fetch<JihulabRepo[]>(`https://jihulab.com/api/v4/projects?access_token=${accessToken}&per_page=100&order_by=created_at&sort=desc&owned=true`, {
        method: "GET",
        timeout: 10,
    });
    if (res.ok && res.status == 200) {
        return res.data;
    } else {
        console.log(res);
        throw "error list repo";
    }
}