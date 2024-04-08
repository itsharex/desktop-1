import { gen_ssh_key, list_ssh_key_name } from "@/api/local_repo";
import { resolve } from "@tauri-apps/api/path";
import { Button, Divider, Form, Input, List, message, Modal, Space } from "antd";
import React, { useEffect, useState } from "react";
import { homeDir } from '@tauri-apps/api/path';
import { readTextFile, exists as existPath, createDir, writeTextFile } from '@tauri-apps/api/fs';
import { writeText } from '@tauri-apps/api/clipboard';
import { open as shell_open } from '@tauri-apps/api/shell';
import { useStores } from "@/hooks";
import { USER_TYPE_ATOM_GIT } from "@/api/user";

export interface SshKeyListModalProps {
    onCount: (count: number) => void;
    onClose: () => void;
}

const SshKeyListModal = (props: SshKeyListModalProps) => {
    const userStore = useStores('userStore');

    const [sshNameList, setSshNameList] = useState([] as string[]);
    const [inGen, setInGen] = useState(false);
    const [newSshName, setNewSshName] = useState("");

    const loadSshNameList = async () => {
        const res = await list_ssh_key_name();
        setSshNameList(res);
        props.onCount(res.length);
        if (res.length == 0) {
            setNewSshName("id_rsa")
        }
    };

    const copyPubKey = async (sshName: string) => {
        const home = await homeDir();
        const path = await resolve(home, ".ssh", sshName + ".pub");
        const content = await readTextFile(path);
        await writeText(content);
        message.info("复制成功");
    }

    const openSshDir = async () => {
        const home = await homeDir();
        const path = await resolve(home, ".ssh");
        await shell_open(path);
    };

    const genNewSshKey = async () => {
        //检查.ssh目录
        const home = await homeDir();
        const sshDirPath = await resolve(home, ".ssh");
        const exist = await existPath(sshDirPath);
        if (!exist) {
            await createDir(sshDirPath);
        }
        //检查目标文件是否存在
        const privKeyPath = await resolve(home, ".ssh", newSshName);
        const exist2 = await existPath(privKeyPath);
        if (exist2) {
            message.error("存在同名密钥");
            return;
        }
        try {
            setInGen(true);
            const keyPair = await gen_ssh_key();
            await writeTextFile(privKeyPath, keyPair.priv_key);
            await writeTextFile(privKeyPath + ".pub", keyPair.pub_key);
            await loadSshNameList();
            message.info("生成成功");
            setNewSshName("");
        } finally {
            setInGen(false);
        }
    };

    useEffect(() => {
        loadSshNameList();
    }, []);

    return (
        <Modal open title={
            <span>
                SSH密钥&nbsp;
                {userStore.userInfo.userType == USER_TYPE_ATOM_GIT && (
                    <>
                        (<a onClick={e=>{
                            e.stopPropagation();
                            e.preventDefault();
                            shell_open("https://atomgit.com/-/profile/keys");
                        }}>设置AtomGit密钥</a>)
                    </>
                )}
            </span>} footer={null}
            bodyStyle={{ maxHeight: "calc(100vh - 300px)", overflowY: "scroll" }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onClose();
            }}>
            <List dataSource={sshNameList} renderItem={sshName => (
                <List.Item key={sshName} extra={
                    <Space>
                        <Button type="link" onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            copyPubKey(sshName);
                        }}>复制公钥</Button>
                        <Button type="link" onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            openSshDir();
                        }}>打开目录</Button>
                    </Space>
                }>
                    {sshName}
                </List.Item>
            )} />
            <Divider />
            <Form>
                <Form.Item label="密钥名称" help={
                    <>
                        {inGen == true && "生成中，请稍等..."}
                    </>
                }>
                    <Space>
                        <Input style={{ width: "320px" }} value={newSshName} disabled={inGen} onChange={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setNewSshName(e.target.value.trim());
                        }} />
                        <Button type="primary" disabled={inGen || newSshName == ""} onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            genNewSshKey();
                        }}>生成密钥</Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default SshKeyListModal;