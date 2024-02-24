import { Button, Card, Form, Input, InputNumber, List, Modal, Tabs, message } from "antd";
import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import type { IdeaStoreCate, IdeaStore } from "@/api/project_idea";
import { create_group, list_store_cate, list_store, import_store } from "@/api/project_idea";
import { useStores } from "@/hooks";
import { request } from "@/utils/request";


interface ImportIdeaStoreProps {
    importStoreId: string;
    onChange: (newStoreId: string) => void;
}

const ImportIdeaStore = observer((props: ImportIdeaStoreProps) => {
    const [storeCateList, setStoreCateList] = useState([] as IdeaStoreCate[]);
    const [storeList, setStoreList] = useState([] as IdeaStore[]);

    const loadStoreCateList = async () => {
        const res = await request(list_store_cate({}));
        setStoreCateList(res.cate_list);
    };

    const loadStoreList = async () => {
        const res = await request(list_store({
            filter_by_store_cate_id: false,
            store_cate_id: "",
        }));
        setStoreList(res.store_list);
    };


    useEffect(() => {
        loadStoreCateList();
        loadStoreList();
    }, []);

    return (
        <div style={{ maxHeight: "calc(100vh - 400px)", overflowY: "scroll" }}>
            {storeCateList.map(cateItem => (
                <Card title={cateItem.name} bordered={false}>
                    <List rowKey="idea_store_id" dataSource={storeList.filter(storeItem => storeItem.store_cate_id == cateItem.store_cate_id)}
                        grid={{ gutter: 16 }}
                        renderItem={storeItem => (
                            <List.Item>
                                <Button type="text" style={{ backgroundColor: (storeItem.idea_store_id == props.importStoreId) ? "#0078F7" : "#eee" }}
                                    onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        props.onChange(storeItem.idea_store_id);
                                    }}>{storeItem.name}</Button>
                            </List.Item>
                        )} />
                </Card>
            ))}
        </div>
    );
});

export interface CreateOrImportGroupModalProps {
    onClose: () => void;
}

const CreateOrImportGroupModal = (props: CreateOrImportGroupModalProps) => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');

    const [activeKey, setActiveKey] = useState<"add" | "import">("add");

    const [groupName, setGroupName] = useState("");
    const [groupWeight, setGroupWeight] = useState(0);

    const [importStoreId, setImportStoreId] = useState("");

    const isValid = () => {
        if (activeKey == "add" && groupName != "") {
            return true;
        } else if (activeKey == "import" && importStoreId != "") {
            return true;
        }
        return false;
    };

    const createGroup = async () => {
        if (groupName == "") {
            return;
        }
        await request(create_group({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            name: groupName,
            weight: groupWeight,
        }));
        message.info("创建知识点分组成功");
        props.onClose();
    };

    const importStore = async () => {
        if (importStoreId == "") {
            return;
        }
        await request(import_store({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            idea_store_id: importStoreId,
        }));
        message.info("导入知识库成功");
        setImportStoreId("");
        props.onClose();
    };

    return (
        <Modal open
            okText={activeKey == "add" ? "创建" : "导入"}
            okButtonProps={{ disabled: !isValid() }}
            bodyStyle={{ padding: "4px 10px" }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onClose();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                if (activeKey == "add") {
                    createGroup();
                } else if (activeKey == "import") {
                    importStore();
                }
            }}>
            <Tabs activeKey={activeKey} onChange={key => setActiveKey(key as "add" | "import")}
                type="card"
                items={[
                    {
                        key: "add",
                        label: "创建知识点分组",
                        children: (
                            <Form labelCol={{ span: 3 }}>
                                <Form.Item label="名称">
                                    <Input value={groupName} onChange={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setGroupName(e.target.value.trim());
                                    }} />
                                </Form.Item>
                                <Form.Item label="排序权重" help="数值越大，排序越前。有效值(0-99)">
                                    <InputNumber value={groupWeight} onChange={value => {
                                        if (value != null) {
                                            setGroupWeight(value);
                                        }
                                    }} precision={0} min={0} max={99} controls={false} style={{ width: "100%" }} />
                                </Form.Item>
                            </Form>
                        ),
                    },
                    {
                        key: "import",
                        label: "导入知识点仓库",
                        children: <ImportIdeaStore importStoreId={importStoreId} onChange={newStoreId => setImportStoreId(newStoreId)} />,
                    }
                ]} />
        </Modal>
    );
};

export default observer(CreateOrImportGroupModal);