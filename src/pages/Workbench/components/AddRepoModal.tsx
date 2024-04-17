import { Modal, Form, Input, Button, message, Radio, Progress, Select } from "antd";
import React, { useEffect, useState } from "react";
import type { CloneProgressInfo } from "@/api/local_repo";
import { FolderOpenOutlined } from "@ant-design/icons";
import { open as open_dialog, save as save_dialog } from '@tauri-apps/api/dialog';
import { get_repo_status, add_repo, clone as clone_repo, list_ssh_key_name, test_ssh } from "@/api/local_repo";
import { uniqId } from "@/utils/utils";
import { useStores } from "@/hooks";
import { observer } from 'mobx-react';
import { USER_TYPE_ATOM_GIT } from "@/api/user";
import { documentDir, resolve } from "@tauri-apps/api/path";
import { homeDir } from '@tauri-apps/api/path';

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
    const [authType, setAuthType] = useState<"none" | "privkey" | "password">("none");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [cloneProgress, setCloneProgress] = useState<CloneProgressInfo | null>(null);

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
            if (authType == "privkey" && curSshKey == "") {
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
            await get_repo_status(localPath);
            await add_repo(uniqId(), name.trim(), localPath.trim());
            props.onOk();
        } catch (e) {
            console.log(e);
            message.error(`${e}`);
        }
    };

    const cloneRepo = async () => {
        setCloneProgress(null);
        try {
            if(authType == "privkey") {
                await test_ssh(remoteUrl);
            }
            const homePath = await homeDir();
            const privKey = await resolve(homePath, ".ssh", curSshKey);
            await clone_repo(localPath, remoteUrl, authType, username, password, privKey, info => {
                setCloneProgress(info);
                if (info.totalObjs == info.indexObjs) {
                    add_repo(uniqId(), name.trim(), localPath.trim()).then(() => {
                        props.onOk();
                    }).catch(e => {
                        console.log(e);
                        message.error(`${e}`);
                    });
                    setCloneProgress(null);
                }
            });
        } catch (e) {
            console.log(e);
            message.error(`${e}`);
            setCloneProgress(null);
        }
    };

    useEffect(() => {
        if (remoteUrl.startsWith("git@")) {
            setAuthType("privkey");
        } else if (remoteUrl.startsWith("http")) {
            if (authType == "privkey") {
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
            okText={repoType == "local" ? "添加" : "克隆"} okButtonProps={{ disabled: !checkValid() || cloneProgress != null }}
            cancelButtonProps={{ disabled: cloneProgress != null }}
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
            <Form labelCol={{ span: 3 }} disabled={cloneProgress != null}>
                <Form.Item label="名称">
                    <Input value={name} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setName(e.target.value);
                    }} placeholder="请输入项目名称" />
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
                        }} disabled={props.remoteUrl != undefined} placeholder="请输入远程仓库地址" />
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
                        }} />} placeholder="请输入本地路径" />
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
                                    <Radio value="privkey" disabled={remoteUrl.startsWith("http")}>SSH公钥</Radio>
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
                                    }} placeholder="请输入远程Git仓库账号" />
                                </Form.Item>
                                <Form.Item label="密码">
                                    <Input.Password value={password} onChange={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setPassword(e.target.value.trim());
                                    }} placeholder="请输入账号密码或双重认证密码" />
                                </Form.Item>
                            </>
                        )}
                        {authType == "privkey" && (
                            <Form.Item label="SSH密钥">
                                <Select value={curSshKey} onChange={key => setCurSshKey(key)}>
                                    {sshKeyNameList.map(sshName => (
                                        <Select.Option key={sshName} value={sshName}>{sshName}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        )}
                        {cloneProgress != null && (
                            <>
                                <Form.Item label="下载进度">
                                    <Progress percent={cloneProgress.totalObjs == 0 ? 100 : Math.round(cloneProgress.recvObjs * 100 / cloneProgress.totalObjs)} />
                                </Form.Item>
                                <Form.Item label="索引进度">
                                    <Progress percent={cloneProgress.totalObjs == 0 ? 100 : Math.round(cloneProgress.indexObjs * 100 / cloneProgress.totalObjs)} />
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