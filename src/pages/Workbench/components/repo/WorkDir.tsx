import React, { useEffect, useState } from "react";
import { Button, Card, List, Space, Breadcrumb, Modal, Form, Select, Radio, Input, message, Progress } from "antd";
import { open as open_dir } from '@tauri-apps/api/shell';
import { DownloadOutlined, FileOutlined, FolderOutlined, UploadOutlined } from "@ant-design/icons";
import { readDir, type FileEntry } from '@tauri-apps/api/fs';
import { homeDir, resolve } from '@tauri-apps/api/path';
import { type WidgetInfo } from "@/api/widget";
import GitFile from "./GitFile";
import type { RemoteInfo } from "@/api/local_repo";
import { checkout_branch, fetch_remote, get_repo_status, list_remote, list_ssh_key_name, run_pull, run_push } from "@/api/local_repo";
import { useStores } from "@/hooks";
import { observer } from 'mobx-react';
import { USER_TYPE_ATOM_GIT } from "@/api/user";


interface ModalProps {
    headBranch: string;
    repoPath: string;
    onClose: () => void;
}

const PullModal = observer((props: ModalProps) => {
    const userStore = useStores('userStore');

    const [curRemote, setCurRemote] = useState<RemoteInfo | null>(null);
    const [remoteList, setRemoteList] = useState([] as RemoteInfo[]);

    const [authType, setAuthType] = useState<"none" | "privkey" | "password">("none");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [sshKeyNameList, setSshKeyNameList] = useState([] as string[]);
    const [curSshKey, setCurSshKey] = useState("");

    const [inPull, setInPull] = useState(false);

    const [recvRatio, setRecvRatio] = useState(0);
    const [indexRatio, setIndexRatio] = useState(0);

    const loadRemoteList = async () => {
        const res = await list_remote(props.repoPath);
        setRemoteList(res);
        const index = res.findIndex(item => item.name == "origin");
        if (index != -1) {
            setCurRemote(res[index]);
        } else {
            if (res.length > 0) {
                setCurRemote(res[0]);
            }
        }
    };

    const runPull = async () => {
        //检查是否有文件变更
        const statusRes = await get_repo_status(props.repoPath);
        if (statusRes.path_list.length > 0) {
            message.warn("本地有文件修改未提交，请先提交文件");
            return;
        }
        const home = await homeDir();
        const privKeyPath = await resolve(home, ".ssh", curSshKey);
        try {
            setInPull(true);
            await fetch_remote(props.repoPath, curRemote?.name ?? "", authType, username, password, privKeyPath, info => {
                setRecvRatio(info.recvObjs / Math.max(info.totalObjs, 1) * 100);
                setIndexRatio(info.indexObjs / Math.max(info.totalObjs, 1) * 100);
            });
            await run_pull(props.repoPath, curRemote?.name ?? "", props.headBranch);
            message.info("拉取成功");
            props.onClose();
        } catch (e) {
            message.error(`${e}`);
        } finally {
            setInPull(false);
            setRecvRatio(0);
            setIndexRatio(0);
        }
    };

    useEffect(() => {
        loadRemoteList();
    }, [props.repoPath]);

    useEffect(() => {
        if (curRemote == null) {
            return;
        }
        const remoteUrl = curRemote.url;
        if (remoteUrl.includes("atomgit") && userStore.userInfo.userType == USER_TYPE_ATOM_GIT) {
            setUsername(userStore.userInfo.userName.substring("atomgit:".length));
        }
        if (remoteUrl.startsWith("git@")) {
            setAuthType("privkey");
        } else if (remoteUrl.startsWith("http")) {
            if (authType == "privkey") {
                setAuthType("none");
            }
        }
    }, [curRemote?.url]);

    useEffect(() => {
        list_ssh_key_name().then(res => {
            setSshKeyNameList(res);
            if (res.length > 0) {
                setCurSshKey(res[0]);
            }
        });
    }, []);

    return (
        <Modal open title="拉取提交"
            okText="拉取" okButtonProps={{ disabled: (curRemote == null) || inPull }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onClose();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                runPull();
            }}>
            <Form>
                <Form.Item label="远程仓库">
                    <Select value={curRemote?.name ?? ""} onChange={value => {
                        const tmpItem = remoteList.find(item => item.name == value);
                        setCurRemote(tmpItem ?? null);
                    }}>
                        {remoteList.map(item => (
                            <Select.Option key={item.name} value={item.name}>{item.name}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                {curRemote != null && (
                    <Form.Item label="远程地址">
                        {curRemote.url}
                    </Form.Item>
                )}
                {(curRemote != null) && (curRemote.url.startsWith("git@") || curRemote.url.startsWith("http")) && (
                    <Form.Item label="验证方式">
                        <Radio.Group value={authType} onChange={e => {
                            e.stopPropagation();
                            setAuthType(e.target.value);
                        }}>
                            <Radio value="none" disabled={curRemote.url.startsWith("git@")}>无需验证</Radio>
                            <Radio value="password" disabled={curRemote.url.startsWith("git@")}>账号密码</Radio>
                            <Radio value="privkey" disabled={curRemote.url.startsWith("http")}>SSH公钥</Radio>
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
                {recvRatio != 0 && (
                    <Form.Item label="下载进度">
                        <Progress percent={recvRatio} showInfo={false} />
                    </Form.Item>
                )}
                {indexRatio != 0 && (
                    <Form.Item label="索引进度">
                        <Progress percent={indexRatio} showInfo={false} />
                    </Form.Item>
                )}
            </Form>
        </Modal>
    );
});

const PushModal = observer((props: ModalProps) => {
    const userStore = useStores('userStore');

    const [curRemote, setCurRemote] = useState<RemoteInfo | null>(null);
    const [remoteList, setRemoteList] = useState([] as RemoteInfo[]);

    const [authType, setAuthType] = useState<"none" | "privkey" | "password">("none");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [sshKeyNameList, setSshKeyNameList] = useState([] as string[]);
    const [curSshKey, setCurSshKey] = useState("");

    const [inPush, setInPush] = useState(false);

    const loadRemoteList = async () => {
        const res = await list_remote(props.repoPath);
        setRemoteList(res);
        const index = res.findIndex(item => item.name == "origin");
        if (index != -1) {
            setCurRemote(res[index]);
        } else {
            if (res.length > 0) {
                setCurRemote(res[0]);
            }
        }
    };

    const runPush = async () => {
        const home = await homeDir();
        const privKeyPath = await resolve(home, ".ssh", curSshKey);
        setInPush(true);
        try {
            await run_push(props.repoPath, curRemote?.name ?? "", props.headBranch, authType, username, password, privKeyPath);
            message.info("推送成功");
            props.onClose();
        } catch (e) {
            message.error(`${e}`);
        } finally {
            setInPush(false);
        }
    };

    useEffect(() => {
        loadRemoteList();
    }, [props.repoPath]);

    useEffect(() => {
        if (curRemote == null) {
            return;
        }
        const remoteUrl = curRemote.url;
        if (remoteUrl.includes("atomgit") && userStore.userInfo.userType == USER_TYPE_ATOM_GIT) {
            setUsername(userStore.userInfo.userName.substring("atomgit:".length));
        }
        if (remoteUrl.startsWith("git@")) {
            setAuthType("privkey");
        } else if (remoteUrl.startsWith("http")) {
            if (authType == "privkey") {
                setAuthType("none");
            }
        }
    }, [curRemote?.url]);

    useEffect(() => {
        list_ssh_key_name().then(res => {
            setSshKeyNameList(res);
            if (res.length > 0) {
                setCurSshKey(res[0]);
            }
        });
    }, []);

    return (
        <Modal open title="推送提交"
            okText="推送" okButtonProps={{ disabled: (curRemote == null) || inPush }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onClose();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                runPush();
            }}>
            <Form>
                <Form.Item label="远程仓库">
                    <Select value={curRemote?.name ?? ""} onChange={value => {
                        const tmpItem = remoteList.find(item => item.name == value);
                        setCurRemote(tmpItem ?? null);
                    }}>
                        {remoteList.map(item => (
                            <Select.Option key={item.name} value={item.name}>{item.name}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                {curRemote != null && (
                    <Form.Item label="远程地址">
                        {curRemote.url}
                    </Form.Item>
                )}
                {(curRemote != null) && (curRemote.url.startsWith("git@") || curRemote.url.startsWith("http")) && (
                    <Form.Item label="验证方式">
                        <Radio.Group value={authType} onChange={e => {
                            e.stopPropagation();
                            setAuthType(e.target.value);
                        }}>
                            <Radio value="none" disabled={curRemote.url.startsWith("git@")}>无需验证</Radio>
                            <Radio value="password" disabled={curRemote.url.startsWith("git@")}>账号密码</Radio>
                            <Radio value="privkey" disabled={curRemote.url.startsWith("http")}>SSH公钥</Radio>
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
            </Form>
        </Modal>
    );
});

interface WorkDirProps {
    basePath: string;
    headBranch: string;
    widgetList: WidgetInfo[];
    filterList: string[];
}

const WorkDir = (props: WorkDirProps) => {
    const [curDirList, setCurDirList] = useState([] as string[]);
    const [fileEntryList, setFileEntryList] = useState([] as FileEntry[]);
    const [showPullModal, setShowPullModal] = useState(false);
    const [showPushModal, setShowPushModal] = useState(false);

    const loadFileEntryList = async () => {
        const path = await resolve(props.basePath, ...curDirList);
        const tmpList = await readDir(path);
        setFileEntryList(tmpList.filter(item => item.name != null && item.name != ".git"));
    };

    useEffect(() => {
        loadFileEntryList();
    }, [curDirList]);

    return (
        <Card bordered={false} bodyStyle={{ height: "calc(100vh - 440px)", overflow: "scroll", paddingTop: "2px" }}
            headStyle={{ backgroundColor: "#eee" }}
            title={
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Button type="link" disabled={curDirList.length == 0} onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setCurDirList([]);
                        }}>
                            根目录
                        </Button>
                    </Breadcrumb.Item>
                    {curDirList.map((name, index) => (
                        <Breadcrumb.Item key={index}>
                            <Button type="link" disabled={(index + 1) == curDirList.length}
                                onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setCurDirList(curDirList.slice(0, index + 1));
                                }}>
                                {name}
                            </Button>
                        </Breadcrumb.Item>
                    ))}
                </Breadcrumb>
            } extra={
                <Space>
                    {props.headBranch != "" && (
                        <Button type="link" icon={<DownloadOutlined style={{ fontSize: "20px" }} />} title={props.filterList.length > 0 ? "请使用命令行工具" : "pull"} onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setShowPullModal(true);
                        }} disabled={props.filterList.length > 0} />
                    )}
                    {props.headBranch != "" && (
                        <Button type="link" icon={<UploadOutlined style={{ fontSize: "20px" }} />} title={props.filterList.length > 0 ? "请使用命令行工具" : "push"} onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setShowPushModal(true);
                        }} disabled={props.filterList.length > 0} />
                    )}
                    <Button type="link" style={{ minWidth: "0px", padding: "2px 0px" }}
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            resolve(props.basePath, ...curDirList).then(path => open_dir(path));
                        }}>在文件管理器中打开</Button>
                </Space>
            }>
            <List rowKey="name" dataSource={fileEntryList} pagination={false}
                grid={{ gutter: 16 }}
                renderItem={entry => (
                    <List.Item style={{ width: "250px" }}>
                        <Space style={{ fontSize: "16px" }}>
                            {entry.children != null && <FolderOutlined />}
                            {entry.children == null && <FileOutlined />}
                            {entry.children != null && (
                                <a onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setCurDirList([...curDirList, entry.name ?? ""]);
                                }} title={entry.name ?? ""} style={{ display: "inline-block", width: "200px", overflow: "hidden", textAlign: "left" }}>{entry.name}</a>
                            )}
                            {entry.children == null && (
                                <GitFile basePath={props.basePath} curDirList={curDirList} curFileName={entry.name ?? ""} widgetList={props.widgetList} />
                            )}
                        </Space>
                    </List.Item>
                )} />
            {showPullModal == true && (
                <PullModal repoPath={props.basePath} headBranch={props.headBranch} onClose={() => {
                    setShowPullModal(false);
                    loadFileEntryList();
                }} />
            )}
            {showPushModal == true && (
                <PushModal repoPath={props.basePath} headBranch={props.headBranch} onClose={() => setShowPushModal(false)} />
            )}
        </Card>
    );
};

export default WorkDir;