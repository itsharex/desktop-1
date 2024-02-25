import React, { useEffect, useState } from "react";
import { Button, Card, List, Modal } from "antd";
import type { IdeaStoreCate, IdeaStore } from "@/api/project_idea";
import { list_store_cate, list_store } from "@/api/project_idea";
import { request } from "@/utils/request";


export interface StoreListModalProps {
    disableStoreId: string;
    onCancel: () => void;
    onOk: (storeId: string) => void;
}

const StoreListModal = (props: StoreListModalProps) => {
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
        <Modal open title="选择知识库"
            bodyStyle={{ maxHeight: "calc(100vh - 300px)", overflowY: "scroll" }}
            footer={null}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}>
            {storeCateList.map(cateItem => (
                <Card key={cateItem.store_cate_id} title={cateItem.name} bordered={false}>
                    <List rowKey="idea_store_id" dataSource={storeList.filter(storeItem => storeItem.store_cate_id == cateItem.store_cate_id)}
                        grid={{ gutter: 16 }}
                        renderItem={storeItem => (
                            <List.Item>
                                <Button type="link" disabled={storeItem.idea_store_id == props.disableStoreId}
                                    onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        props.onOk(storeItem.idea_store_id);
                                    }}>{storeItem.name}</Button>
                            </List.Item>
                        )} />
                </Card>
            ))}
        </Modal>
    );
};

export default StoreListModal;