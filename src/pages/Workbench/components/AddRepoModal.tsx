//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { Modal, Form, Input, Button, message, Radio, Progress, Select } from "antd";
import React, { useEffect, useState } from "react";
import { FolderOpenOutlined } from "@ant-design/icons";
import { open as open_dialog, save as save_dialog } from '@tauri-apps/api/dialog';
import { add_repo, list_ssh_key_name } from "@/api/local_repo";
import { uniqId } from "@/utils/utils";
import { useStores } from "@/hooks";
import { observer } from 'mobx-react';
import { USER_TYPE_ATOM_GIT } from "@/api/user";
import { documentDir, resolve } from "@tauri-apps/api/path";
import { homeDir } from '@tauri-apps/api/path';
import type { GitProgressItem, AUTH_TYPE } from "@/api/git_wrap";
import { run_status, clone as clone_repo, test_ssh } from "@/api/git_wrap";

interface AddRepoModalProps {
    name?: string;
    enName?: string;
    remoteUrl?: string;
    onCancel: () => void;
    onOk: () => void;
}

const AddRepoModal: React.FC<AddRepoModalProps> = (props) => {
    const userStore = useStores('userStore');

    const [name, setName] = useState(props.name ?? "");
    const [repoType, setRepoType] = useState<"local" | "remote">(props.remoteUrl == undefined ? "local" : "remote");
    const [remoteUrl, setRemoteUrl] = useState(props.remoteUrl ?? "");
    const [localPath, setLocalPath] = useState("");
    const [authType, setAuthType] = useState<AUTH_TYPE>("none");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [cloneProgress, setCloneProgress] = useState<GitProgressItem | null>(null);
    const [inClone, setInClone] = useState(false);

    const [sshKeyNameList, setSshKeyNameList] = useState([] as string[]);
    const [curSshKey, setCurSshKey] = useState("");

    const choiceLocalPath = async () => {
        const home = await documentDir();
        if (repoType == "local") {
            const selected = await open_dialog({
                title: "项目代码路径",
                directory: true,
                defaultPath: home,
            });
            if (selected == null || Array.isArray(selected)) {
                return;
            }
            setLocalPath(selected);
        } else {
            const savePath = await resolve(home, props.enName ?? "new_prj");
            const selected = await save_dialog({
                title: "保存路径",
                defaultPath: savePath,
            });
            if (selected == null) {
                return;
            }
            setLocalPath(selected);
        }
    };

    const checkValid = () => {
        if (name == "") {
            return false;
        }
        if (localPath == "") {
            return false;
        }
        if (repoType == "remote") {
            if (remoteUrl == "") {
                return false;
            }
            if (authType == "sshKey" && curSshKey == "") {
                return false;
            } else if (authType == "password") {
                if (username == "" || password == "") {
                    return false;
                }
            }
        }
        return true;
    };

    const addRepo = async () => {
        try {
            await run_status(localPath);
            await add_repo(uniqId(), name.trim(), localPath.trim());
            props.onOk();
        } catch (e) {
            console.log(e);
            message.error(`${e}`);
        }
    };

    const cloneRepo = async () => {
        setCloneProgress({
            stage: "克隆中",
            doneCount: 0,
            totalCount: 1,
        });
        setInClone(true);
        try {
            const homePath = await homeDir();
            const privKey = await resolve(homePath, ".ssh", curSshKey);
            if (authType == "sshKey") {
                await test_ssh(remoteUrl, privKey);
            }
            await clone_repo(localPath, remoteUrl, authType, username, password, privKey, info => {
                setCloneProgress(info);
                if (info == null) {
                    setInClone(false);
                    add_repo(uniqId(), name.trim(), localPath.trim()).then(() => {
                        props.onOk();
                    }).catch(e => {
                        console.log(e);
                        message.error(`${e}`);
                    });
                }
            });
        } catch (e) {
            console.log(e);
            message.error(`${e}`);
            setInClone(false);
            setCloneProgress(null);
        }
    };

    useEffect(() => {
        if (remoteUrl.startsWith("git@")) {
            setAuthType("sshKey");
        } else if (remoteUrl.startsWith("http")) {
            if (authType == "sshKey") {
                setAuthType("none");
            }
        }
    }, [remoteUrl]);

    useEffect(() => {
        if (remoteUrl.includes("atomgit") && userStore.userInfo.userType == USER_TYPE_ATOM_GIT) {
            setUsername(userStore.userInfo.userName.substring("atomgit:".length));
        }
    }, [remoteUrl]);

    useEffect(() => {
        list_ssh_key_name().then(res => {
            setSshKeyNameList(res);
            if (res.length > 0) {
                setCurSshKey(res[0]);
            }
        });
    }, []);

    return (
        <Modal open title={repoType == "local" ? "添加本地仓库" : "克隆远程仓库"}
            width={800}
            okText={repoType == "local" ? "添加" : "克隆"} okButtonProps={{ disabled: !checkValid() || inClone }}
            cancelButtonProps={{ disabled: inClone }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                if (repoType == "local") {
                    addRepo();
                } else {
                    cloneRepo();
                }
            }}
        >
            <Form labelCol={{ span: 4 }} disabled={inClone}>
                <Form.Item label="名称">
                    <Input value={name} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setName(e.target.value);
                    }} placeholder="请输入项目名称" status={name == "" ? "error" : undefined} />
                </Form.Item>
                <Form.Item label="仓库类型">
                    <Radio.Group value={repoType} onChange={e => {
                        e.stopPropagation();
                        setRepoType(e.target.value);
                    }}>
                        <Radio value="local">本地仓库</Radio>
                        <Radio value="remote">远程仓库</Radio>
                    </Radio.Group>
                </Form.Item>
                {repoType == "remote" && (
                    <Form.Item label="远程地址">
                        <Input value={remoteUrl} onChange={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setRemoteUrl(e.target.value.trim());
                        }} disabled={props.remoteUrl != undefined} placeholder="请输入远程仓库地址" status={remoteUrl == "" ? "error" : undefined} />
                    </Form.Item>
                )}
                <Form.Item label="本地路径">
                    <Input value={localPath} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setLocalPath(e.target.value);
                    }}
                        addonAfter={<Button type="link" style={{ height: 20 }} icon={<FolderOpenOutlined />} onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            choiceLocalPath();
                        }} />} placeholder="请输入本地路径" status={localPath == "" ? "error" : undefined}/>
                </Form.Item>
                {repoType == "remote" && (
                    <>
                        {(remoteUrl.startsWith("git@") || remoteUrl.startsWith("http")) && (
                            <Form.Item label="验证方式">
                                <Radio.Group value={authType} onChange={e => {
                                    e.stopPropagation();
                                    setAuthType(e.target.value);
                                }}>
                                    <Radio value="none" disabled={remoteUrl.startsWith("git@")}>无需验证</Radio>
                                    <Radio value="password" disabled={remoteUrl.startsWith("git@")}>账号密码</Radio>
                                    <Radio value="sshKey" disabled={remoteUrl.startsWith("http")}>SSH公钥</Radio>
                                </Radio.Group>
                            </Form.Item>
                        )}

                        {authType == "password" && (
                            <>
                                <Form.Item label="账号">
                                    <Input value={username} onChange={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setUsername(e.target.value.trim());
                                    }} placeholder="请输入远程Git仓库账号" status={username == "" ? "error" : undefined}/>
                                </Form.Item>
                                <Form.Item label="密码">
                                    <Input.Password value={password} onChange={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setPassword(e.target.value.trim());
                                    }} placeholder="请输入账号密码或双重认证密码" status={password == "" ? "error" : undefined}/>
                                </Form.Item>
                            </>
                        )}
                        {authType == "sshKey" && (
                            <Form.Item label="SSH密钥">
                                <Select value={curSshKey} onChange={key => setCurSshKey(key)} status={curSshKey == "" ? "error" : undefined}>
                                    {sshKeyNameList.map(sshName => (
                                        <Select.Option key={sshName} value={sshName}>{sshName}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        )}
                        {cloneProgress != null && (
                            <>
                                <Form.Item label={cloneProgress.stage}>
                                    <Progress percent={cloneProgress.totalCount == 0 ? 100 : Math.round(cloneProgress.doneCount * 100 / cloneProgress.totalCount)} />
                                </Form.Item>
                            </>
                        )}
                    </>
                )}
            </Form>
        </Modal>
    );
};

export default observer(AddRepoModal);