//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { invoke } from '@tauri-apps/api/tauri';
import { Command } from '@tauri-apps/api/shell';
import { message } from 'antd';
import { resolve, homeDir } from '@tauri-apps/api/path';
import { exists as exist_path, readDir, readTextFile } from '@tauri-apps/api/fs';

export type SshKeyPairInfo = {
    pub_key: string;
    priv_key: string;
};

export type LocalRepoInfo = {
    id: string;
    name: string;
    path: string;
};

export type LocalRepoPathStatusInfo = {
    path: string;
    status: string[];
};

export type LocalRepoStatusInfo = {
    head: string;
    path_list: LocalRepoPathStatusInfo[];
};

export type LocalRepoBranchInfo = {
    name: string;
    upstream: string;
    commit_id: string;
    commit_summary: string;
    commit_time: number;
}

export type LocalRepoTagInfo = {
    name: string;
    commit_id: string;
    commit_summary: string;
    commit_time: number;
}

export type LocalRepoStashInfo = {
    commit_id: string;
    commit_summary: string;
};

export type LocalRepoCommitInfo = {
    id: string;
    summary: string;
    time_stamp: number;
    commiter: string;
    email: string;
};

export type LocalRepoFileDiffInfo = {
    old_file_name: string;
    old_content: string;
    new_file_name: string;
    new_content: string;
    delta_type: string;
};

export type LocalRepoAnalyseCommitInfo = {
    commit_id: string;
    summary: string;
    add_count: number;
    del_count: number;
};

export type LocalRepoStatItem = {
    commit_count: number;
    total_add_count: number;
    total_del_count: number;
    min_commit: LocalRepoAnalyseCommitInfo;
    max_commit: LocalRepoAnalyseCommitInfo;
};

export type LocalRepoDayStatItem = {
    day_str: string;
    commit_count: number;
    add_count: number;
    del_count: number;
};

export type LocalRepoCommiterStatItem = {
    commiter: string;
    stat: LocalRepoStatItem,
    day_stat_list: LocalRepoDayStatItem[];
};

export type LocalRepoAnalyseInfo = {
    global_stat: LocalRepoStatItem;
    effect_add_count: number;
    effect_del_count: number;
    commiter_stat_list: LocalRepoCommiterStatItem[];
    last_time: number;
}

export type LocalRepoRemoteInfo = {
    name: string;
    url: string;
};

export type CloneProgressInfo = {
    totalObjs: number;
    recvObjs: number;
    indexObjs: number;
};

//git pro相关属性

export type HeadInfo = {
    commit_id: string;
    branch_name: string;
};

export type BranchInfo = {
    name: string;
    upstream: string;
    commit_id: string;
}

export type TagInfo = {
    name: string;
    commit_id: string;
}

export type RemoteInfo = {
    name: string;
    url: string;
}

export type GitInfo = {
    head: HeadInfo,
    branch_list: BranchInfo[];
    tag_list: TagInfo[];
    remote_list: RemoteInfo[];
};

export type GitUserInfo = {
    name: string;
    email: string;
    timestamp: number;
};

export type CommitGraphInfo = {
    refs: string[];
    hash: string;
    hash_abbrev: string;
    tree: string;
    tree_abbrev: string;
    parents: string[];
    parents_abbrev: string[];
    author: GitUserInfo,
    committer: GitUserInfo,
    subject: string;
    body: string;
    notes: string;
    stats: unknown; //特殊处理，不计算，太消耗计算时间
};

export type GitConfigItem = {
    name: string;
    value: string;
}

export async function add_repo(id: string, name: string, path: string): Promise<void> {
    return invoke<void>("plugin:local_repo|add_repo", {
        id,
        name,
        path
    });
}

export async function update_repo(id: string, name: string, path: string): Promise<void> {
    return invoke<void>("plugin:local_repo|update_repo", {
        id,
        name,
        path,
    });
}

export async function remove_repo(id: string): Promise<void> {
    return invoke<void>("plugin:local_repo|remove_repo", {
        id,
    });
}

export async function list_repo(): Promise<LocalRepoInfo[]> {
    return invoke<LocalRepoInfo[]>("plugin:local_repo|list_repo", {});
}

export async function gen_ssh_key(): Promise<SshKeyPairInfo> {
    return invoke<SshKeyPairInfo>("plugin:local_repo|gen_ssh_key", {});
}

export async function get_repo_status(path: string): Promise<LocalRepoStatusInfo> {
    const command = Command.sidecar('bin/gitspy', ["--git-path", path, "status"]);
    const result = await command.execute();
    if (result.code != 0) {
        throw new Error(result.stderr);
    }
    return JSON.parse(result.stdout);
}

export async function list_repo_branch(path: string, remote: boolean = false): Promise<LocalRepoBranchInfo[]> {
    const args = ["--git-path", path, "list-branch"];
    if (remote) {
        args.push("--remote");
    }
    const command = Command.sidecar('bin/gitspy', args);
    const result = await command.execute();
    if (result.code != 0) {
        throw new Error(result.stderr);
    }
    const retList = JSON.parse(result.stdout) as LocalRepoBranchInfo[];
    retList.sort((a, b) => b.commit_time - a.commit_time);
    return retList;
}

export async function list_repo_tag(path: string): Promise<LocalRepoTagInfo[]> {
    const command = Command.sidecar('bin/gitspy', ["--git-path", path, "list-tag"]);
    const result = await command.execute();
    if (result.code != 0) {
        throw new Error(result.stderr);
    }
    const retList = JSON.parse(result.stdout) as LocalRepoTagInfo[];
    retList.sort((a, b) => b.commit_time - a.commit_time);
    return retList.map(item => ({ ...item, name: item.name.startsWith("refs/tags/") ? item.name.substring("refs/tags/".length) : item.name }));
}

export async function list_repo_commit(path: string, refName: string): Promise<LocalRepoCommitInfo[]> {
    const command = Command.sidecar('bin/gitspy', ["--git-path", path, "list-commit", refName]);
    const result = await command.execute();
    if (result.code != 0) {
        throw new Error(result.stderr);
    }
    return JSON.parse(result.stdout);
}

export async function get_commit_change(path: string, commitId: string): Promise<LocalRepoFileDiffInfo[]> {
    const command = Command.sidecar('bin/gitspy', ["--git-path", path, "get-change", commitId]);
    const result = await command.execute();
    if (result.code != 0) {
        throw new Error(result.stderr);
    }
    return JSON.parse(result.stdout);
}

export async function analyse(path: string, branch: string, fromTime: number, toTime: number): Promise<LocalRepoAnalyseInfo> {
    const command = Command.sidecar('bin/gitspy', ["--git-path", path, "analyse", branch, (fromTime / 1000).toFixed(0), (toTime / 1000).toFixed(0)]);
    const result = await command.execute();
    if (result.code != 0) {
        throw new Error(result.stderr);
    }
    return JSON.parse(result.stdout);
}

export async function list_remote(path: string): Promise<LocalRepoRemoteInfo[]> {
    const command = Command.sidecar('bin/gitspy', ["--git-path", path, "list-remote"]);
    const result = await command.execute();
    if (result.code != 0) {
        throw new Error(result.stderr);
    }
    return JSON.parse(result.stdout);
}

export async function list_stash(path: string): Promise<LocalRepoStashInfo[]> {
    const command = Command.sidecar('bin/gitspy', ["--git-path", path, "list-stash"]);
    const result = await command.execute();
    if (result.code != 0) {
        throw new Error(result.stderr);
    }
    return JSON.parse(result.stdout);
}

export async function apply_stash(path: string, commitId: string): Promise<void> {
    const command = Command.sidecar('bin/gitspy', ["--git-path", path, "apply-stash", commitId]);
    const result = await command.execute();
    if (result.code != 0) {
        throw new Error(result.stderr);
    }
}

export async function drop_stash(path: string, commitId: string): Promise<void> {
    const command = Command.sidecar('bin/gitspy', ["--git-path", path, "drop-stash", commitId]);
    const result = await command.execute();
    if (result.code != 0) {
        throw new Error(result.stderr);
    }
}

export async function save_stash(path: string, msg: string): Promise<void> {
    const command = Command.sidecar('bin/gitspy', ["--git-path", path, "save-stash", msg]);
    const result = await command.execute();
    if (result.code != 0) {
        throw new Error(result.stderr);
    }
}

export async function checkout_branch(path: string, branch: string): Promise<void> {
    const command = Command.sidecar('bin/gitspy', ["--git-path", path, "checkout-branch", branch]);
    const result = await command.execute();
    if (result.code != 0) {
        throw new Error(result.stderr);
    }
}

export async function create_branch(path: string, srcBranch: string, destBranch: string): Promise<void> {
    const command = Command.sidecar('bin/gitspy', ["--git-path", path, "create-branch", srcBranch, destBranch]);
    const result = await command.execute();
    if (result.code != 0) {
        throw new Error(result.stderr);
    }
}

export async function remove_branch(path: string, branch: string, force: boolean = false): Promise<void> {
    const args = ["--git-path", path, "remove-branch"];
    if (force) {
        args.push("--force");
    }
    args.push(branch);
    const command = Command.sidecar('bin/gitspy', args);
    const result = await command.execute();
    if (result.code != 0) {
        throw new Error(result.stderr);
    }
}

export async function remove_tag(path: string, tag: string): Promise<void> {
    const command = Command.sidecar('bin/gitspy', ["--git-path", path, "remove-tag", tag]);
    const result = await command.execute();
    if (result.code != 0) {
        throw new Error(result.stderr);
    }
}

export async function create_tag(path: string, tag: string, commitId: string, msg: string): Promise<void> {
    const command = Command.sidecar('bin/gitspy', ["--git-path", path, "create-tag", tag, commitId, msg]);
    const result = await command.execute();
    if (result.code != 0) {
        throw new Error(result.stderr);
    }
}


export async function clone(path: string, url: string, authType: string, username: string, password: string, privKey: string, callback: (info: CloneProgressInfo | null) => void): Promise<void> {
    const args = ["--git-path", path, "clone", "--auth-type", authType];
    if (authType == "privkey") {
        args.push(...["--priv-key", privKey]);
    } else if (authType == "password") {
        args.push(...["--username", username, "--password", password]);
    }
    args.push(url);
    const command = Command.sidecar('bin/gitspy', args);
    command.stdout.on("data", (line: string) => {
        const parts = line.split(":");
        if (parts.length == 3) {
            callback({
                totalObjs: parseInt(parts[0]),
                recvObjs: parseInt(parts[1]),
                indexObjs: parseInt(parts[2]),
            });
        }
    });
    command.on("close", () => {
        callback(null);
    });
    command.stderr.on("data", line => message.error(line));
    await command.spawn();
}

export async function fetch_remote(path: string, remoteName: string, authType: string, username: string, password: string, privKey: string, callback: (info: CloneProgressInfo | null) => void): Promise<void> {
    const args = ["--git-path", path, "fetch-remote", "--auth-type", authType];
    if (authType == "privkey") {
        args.push(...["--priv-key", privKey]);
    } else if (authType == "password") {
        args.push(...["--username", username, "--password", password]);
    }
    args.push(remoteName);
    const command = Command.sidecar('bin/gitspy', args);
    command.stdout.on("data", (line: string) => {
        const parts = line.split(":");
        if (parts.length == 3) {
            callback({
                totalObjs: parseInt(parts[0]),
                recvObjs: parseInt(parts[1]),
                indexObjs: parseInt(parts[2]),
            });
        }
    });
    command.on("close", () => {
        callback(null);
    });
    command.stderr.on("data", line => message.error(line));
    await command.spawn();
}

export async function run_push(path: string, remoteName: string, branch: string, authType: string, username: string, password: string, privKey: string, callback: (current: number, total: number, bytes: number) => void): Promise<void> {
    const args = ["--git-path", path, "push", "--auth-type", authType];
    if (authType == "privkey") {
        args.push(...["--priv-key", privKey]);
    } else if (authType == "password") {
        args.push(...["--username", username, "--password", password]);
    }
    args.push(remoteName);
    args.push(branch);

    const command = Command.sidecar('bin/gitspy', args);
    command.stdout.on("data", (line: string) => {
        const parts = line.split(":");
        if (parts.length == 3) {
            callback(
                parseInt(parts[0]),
                parseInt(parts[1]),
                parseInt(parts[2]),
            );
        }
    });
    command.stderr.on("data", line => message.error(line));
    await command.spawn();
}

export async function run_pull(path: string, remoteName: string, branch: string): Promise<void> {
    const command = Command.sidecar('bin/gitspy', ["--git-path", path, "pull", remoteName, branch]);
    const result = await command.execute();
    if (result.code != 0) {
        throw new Error(result.stderr);
    }
    return;
}

export async function get_git_info(path: string): Promise<GitInfo> {
    const command = Command.sidecar('bin/gitspy', ["--git-path", path, "info"]);
    const result = await command.execute();
    if (result.code != 0) {
        throw new Error(result.stderr);
    }
    const retItem = JSON.parse(result.stdout) as GitInfo;
    retItem.tag_list = retItem.tag_list.map(item => ({ ...item, name: item.name.startsWith("refs/tags/") ? item.name.substring("refs/tags/".length) : item.name }));
    return retItem;
}

export async function get_head_info(path: string): Promise<HeadInfo> {
    const command = Command.sidecar('bin/gitspy', ["--git-path", path, "head"]);
    const result = await command.execute();
    if (result.code != 0) {
        throw new Error(result.stderr);
    }
    return JSON.parse(result.stdout) as HeadInfo;
}

export async function list_commit_graph(path: string, commitId: string): Promise<CommitGraphInfo[]> {
    const command = Command.sidecar('bin/gitspy', ["--git-path", path, "commit-graph", commitId]);
    const result = await command.execute();
    if (result.code != 0) {
        throw new Error(result.stderr);
    }
    return JSON.parse(result.stdout);
}

export async function add_to_index(path: string, filePathList: string[]): Promise<void> {
    const command = Command.sidecar('bin/gitspy', ["--git-path", path, "add-to-index", ...filePathList]);
    const result = await command.execute();
    if (result.code != 0) {
        throw new Error(result.stderr);
    }
    return;
}

export async function remove_from_index(path: string, filePathList: string[]): Promise<void> {
    const command = Command.sidecar('bin/gitspy', ["--git-path", path, "remove-from-index", ...filePathList]);
    const result = await command.execute();
    if (result.code != 0) {
        throw new Error(result.stderr);
    }
    return;
}

export async function run_commit(path: string, msg: string): Promise<void> {
    const command = Command.sidecar('bin/gitspy', ["--git-path", path, "commit", msg]);
    const result = await command.execute();
    if (result.code != 0) {
        throw new Error(result.stderr);
    }
    return;
}

export async function list_config(): Promise<GitConfigItem[]> {
    const command = Command.sidecar('bin/gitspy', ["--git-path", ".", "list-config"]);
    const result = await command.execute();
    if (result.code != 0) {
        throw new Error(result.stderr);
    }
    return JSON.parse(result.stdout);
}

export async function set_config(name: string, value: string): Promise<void> {
    const command = Command.sidecar('bin/gitspy', ["--git-path", ".", "set-config", name, value]);
    const result = await command.execute();
    if (result.code != 0) {
        throw new Error(result.stderr);
    }
    return;
}

export function get_http_url(url: string): string {
    if (url.startsWith("http")) {
        if (url.endsWith(".git")) {
            return url.substring(0, url.length - 4);
        } else {
            return url;
        }
    } else if (url.includes("@") && url.includes(":")) {
        const pos1 = url.indexOf("@");
        const pos2 = url.indexOf(":")
        const host = url.substring(pos1 + 1, pos2);
        let uri = url.substring(pos2 + 1);
        if (uri.endsWith(".git")) {
            uri = uri.substring(0, uri.length - 4);
        }
        return `https://${host}/${uri}`;
    }
    return url;
}


export function get_host(url: string): string {
    const l = new URL(get_http_url(url));
    return l.host
}

export async function test_ssh(url: string): Promise<void> {
    const host = get_host(url);
    const homePath = await homeDir();
    const hostsPath = await resolve(homePath, ".ssh", "known_hosts");
    const command = Command.sidecar('bin/gitspy', ["--git-path", ".", "test-ssh", host, hostsPath]);
    const result = await command.execute();
    if (result.code != 0) {
        throw new Error(result.stderr);
    }
    return;
}

export async function list_ssh_key_name(): Promise<string[]> {
    const homePath = await homeDir();
    const sshDirPath = await resolve(homePath, ".ssh");
    const exist = await exist_path(sshDirPath);
    if (!exist) {
        return [];
    }
    const tmpSet: Set<string> = new Set();
    const fileList = await readDir(sshDirPath);
    for (const file of fileList) {
        if (file.children == null) {
            tmpSet.add(file.name ?? "");
        }
    }
    const retList = [] as string[];
    for (const file of tmpSet) {
        if (tmpSet.has(file + ".pub")) {
            retList.push(file);
        }
    }
    return retList;
}

export async function list_git_filter(path: string): Promise<string[]> {
    const attrPath = await resolve(path, ".gitattributes");
    const exist = await exist_path(attrPath);
    if (!exist) {
        return [];
    }
    const filterSet = new Set<string>();
    const lines = await readTextFile(attrPath);
    const p = /\s+filter=([^\s]*)/;
    for (const line of lines.split("\n")) {
        const match = line.match(p);
        if (match == null) {
            continue
        }
        filterSet.add(match[1]);
    }
    const retList: string[] = [];
    for (const filter of filterSet.keys()) {
        retList.push(filter);
    }
    return retList;
}