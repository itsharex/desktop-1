//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { Command } from '@tauri-apps/api/shell';
import { message } from 'antd';
import { get_host } from './local_repo';

export type AUTH_TYPE = "none" | "sshKey" | "password";

export interface GitProgressItem {
    stage: string;
    doneCount: number;
    totalCount: number;
}

export interface GitStatusItem {
    path: string;
    indexChange: boolean;
    indexDelete: boolean;
    workDirChange: boolean;
    workDirDelete: boolean;
}

interface GitwrapResult {
    ok: boolean;
    data: unknown;
}

export interface GitEnvCheckResult {
    hasGit: boolean;
    hasConfigGit: boolean;
    hasGitLfs: boolean;
    hasConfigGitLfs: boolean;
}

export async function add_to_index(repoPath: string, filePath: string): Promise<void> {
    const command = Command.sidecar('bin/gitwrap', ["git", "--localPath", repoPath, "add", filePath]);
    const result = await command.execute();
    if (result.code != 0) {
        const obj = JSON.parse(result.stderr) as GitwrapResult;
        throw new Error(obj.data as string);
    }
}

export async function remove_from_index(repoPath: string, filePath: string): Promise<void> {
    const command = Command.sidecar('bin/gitwrap', ["git", "--localPath", repoPath, "unadd", filePath]);
    const result = await command.execute();
    if (result.code != 0) {
        const obj = JSON.parse(result.stderr) as GitwrapResult;
        throw new Error(obj.data as string);
    }
}

export async function run_commit(repoPath: string, msg: string): Promise<void> {
    const command = Command.sidecar('bin/gitwrap', ["git", "--localPath", repoPath, "commit", msg]);
    const result = await command.execute();
    if (result.code != 0) {
        const obj = JSON.parse(result.stderr) as GitwrapResult;
        throw new Error(obj.data as string);
    }
}

export async function check_git_env(): Promise<GitEnvCheckResult> {
    const command = Command.sidecar('bin/gitwrap', ["check"]);
    const result = await command.execute();
    if (result.code != 0) {
        const obj = JSON.parse(result.stderr) as GitwrapResult;
        throw new Error(obj.data as string);
    }
    const obj = JSON.parse(result.stdout) as GitwrapResult;
    return obj.data as GitEnvCheckResult;
    // return {
    //     hasGit: false,
    //     hasConfigGit: true,
    //     hasGitLfs: true,
    //     hasConfigGitLfs: false,
    // };
}

export async function install_lfs(): Promise<void> {
    const command = Command.sidecar('bin/gitwrap', ["git", "--localPath", ".", "installLfs"]);
    const result = await command.execute();
    if (result.code != 0) {
        const obj = JSON.parse(result.stderr) as GitwrapResult;
        throw new Error(obj.data as string);
    }
}

export async function list_lfs_file(repoPath: string): Promise<string[]> {
    const command = Command.sidecar('bin/gitwrap', ["git", "--localPath", repoPath, "listLfsFile"]);
    const result = await command.execute();
    if (result.code != 0) {
        const obj = JSON.parse(result.stderr) as GitwrapResult;
        throw new Error(obj.data as string);
    }
    const obj = JSON.parse(result.stdout) as GitwrapResult;
    return obj.data as string[];
}

export async function run_status(repoPath: string): Promise<GitStatusItem[]> {
    const command = Command.sidecar('bin/gitwrap', ["git", "--localPath", repoPath, "status"]);
    const result = await command.execute();
    if (result.code != 0) {
        const obj = JSON.parse(result.stderr) as GitwrapResult;
        throw new Error(obj.data as string);
    }
    const obj = JSON.parse(result.stdout) as GitwrapResult;
    return obj.data as GitStatusItem[];
}

export async function checkout(repoPath: string, branchOrTag: string): Promise<void> {
    const command = Command.sidecar('bin/gitwrap', ["git", "--localPath", repoPath, "checkout", branchOrTag]);
    const result = await command.execute();
    if (result.code != 0) {
        const obj = JSON.parse(result.stderr) as GitwrapResult;
        throw new Error(obj.data as string);
    }
}

export async function clone(repoPath: string, repoUrl: string, authType: AUTH_TYPE, username: string, password: string, sshKey: string, callback: (info: GitProgressItem | null) => void): Promise<void> {
    const args = ["git", "--localPath", repoPath, "clone", "--authType", authType];
    if (authType == "sshKey") {
        args.push(...["--sshKey", sshKey]);
    } else if (authType == "password") {
        args.push(...["--user", username, "--password", password]);
    }
    args.push(repoUrl);
    const command = Command.sidecar('bin/gitwrap', args);
    command.stdout.on("data", (line: string) => {
        const parts = line.trim().split("\t");
        if (parts.length == 3) {
            callback({
                stage: parts[0],
                doneCount: parseInt(parts[1]),
                totalCount: parseInt(parts[2]),
            });
        }
    });
    command.on("close", () => {
        callback(null);
    });
    command.stderr.on("data", line => message.error(line));
    await command.spawn();
}

export async function pull(repoPath: string, remoteName: string, branch: string, authType: AUTH_TYPE, username: string, password: string, sshKey: string, callback: (info: GitProgressItem | null) => void): Promise<void> {
    const args = ["git", "--localPath", repoPath, "pull", "--authType", authType];
    if (authType == "sshKey") {
        args.push(...["--sshKey", sshKey]);
    } else if (authType == "password") {
        args.push(...["--user", username, "--password", password]);
    }
    args.push(remoteName);
    args.push(branch);
    const command = Command.sidecar('bin/gitwrap', args);
    command.stdout.on("data", (line: string) => {
        const parts = line.trim().split("\t");
        if (parts.length == 3) {
            callback({
                stage: parts[0],
                doneCount: parseInt(parts[1]),
                totalCount: parseInt(parts[2]),
            });
        }
    });
    command.on("close", () => {
        callback(null);
    });
    command.stderr.on("data", line => message.error(line));
    await command.spawn();
}

export async function push(repoPath: string, remoteName: string, branch: string, authType: AUTH_TYPE, username: string, password: string, sshKey: string, callback: (info: GitProgressItem | null) => void): Promise<void> {
    const args = ["git", "--localPath", repoPath, "push", "--authType", authType];
    if (authType == "sshKey") {
        args.push(...["--sshKey", sshKey]);
    } else if (authType == "password") {
        args.push(...["--user", username, "--password", password]);
    }
    args.push(remoteName);
    args.push(branch);
    const command = Command.sidecar('bin/gitwrap', args);
    command.stdout.on("data", (line: string) => {
        const parts = line.trim().split("\t");
        if (parts.length == 3) {
            callback({
                stage: parts[0],
                doneCount: parseInt(parts[1]),
                totalCount: parseInt(parts[2]),
            });
        }
    });
    command.on("close", () => {
        callback(null);
    });
    command.stderr.on("data", line => message.error(line));
    await command.spawn();
}

export async function add_tag(repoPath: string, tag: string, commitId: string): Promise<void> {
    const command = Command.sidecar('bin/gitwrap', ["git", "--localPath", repoPath, "addTag", tag, commitId]);
    const result = await command.execute();
    if (result.code != 0) {
        const obj = JSON.parse(result.stderr) as GitwrapResult;
        throw new Error(obj.data as string);
    }
}

export async function remove_tag(repoPath: string, tag: string): Promise<void> {
    const command = Command.sidecar('bin/gitwrap', ["git", "--localPath", repoPath, "removeTag", tag]);
    const result = await command.execute();
    if (result.code != 0) {
        const obj = JSON.parse(result.stderr) as GitwrapResult;
        throw new Error(obj.data as string);
    }
}

export async function add_branch(repoPath: string, branch: string, commitId: string): Promise<void> {
    const command = Command.sidecar('bin/gitwrap', ["git", "--localPath", repoPath, "addBranch", branch, commitId]);
    const result = await command.execute();
    if (result.code != 0) {
        const obj = JSON.parse(result.stderr) as GitwrapResult;
        throw new Error(obj.data as string);
    }
}


export async function remove_branch(repoPath: string, branch: string, force: boolean): Promise<void> {
    const args = ["git", "--localPath", repoPath, "removeBranch"]
    if (force) {
        args.push("--force")
    }
    args.push(branch)
    const command = Command.sidecar('bin/gitwrap', args);
    const result = await command.execute();
    if (result.code != 0) {
        const obj = JSON.parse(result.stderr) as GitwrapResult;
        throw new Error(obj.data as string);
    }
}

export async function test_ssh(url: string, sshKey: string): Promise<void> {
    const host = get_host(url);
    const command = Command.sidecar('bin/gitwrap', ["testSsh", `${host}:22`, sshKey]);
    const result = await command.execute();
    if (result.code != 0) {
        throw new Error(result.stderr);
    }
    return;
}