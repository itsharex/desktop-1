import React, { useEffect, useState } from "react";
import type { IdeaStoreCate } from "@/api/idea_store";
import { list_store_cate } from "@/api/idea_store";
import { request } from "@/utils/request";
import { Button, List, Modal } from "antd";

export interface StoreCateListModalProps {
    disableCateId: string;
    onCancel: () => void;
    onOk: (storeCateId: string) => void;
}

const StoreCateListModal = (props: StoreCateListModalProps) => {
    const [storeCateList, setStoreCateList] = useState([] as IdeaStoreCate[]);

    const loadStoreCateList = async () => {
        const res = await request(list_store_cate({}));
        setStoreCateList(res.cate_list);
    };

    useEffect(() => {
        loadStoreCateList();
    }, []);

    return (
        <Modal open title="选择知识库类别"
            footer={null}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}>
            <List rowKey="store_cate_id" dataSource={storeCateList} grid={{ gutter: 16 }} renderItem={item => (
                <List.Item>
                    <Button type="link" disabled={item.store_cate_id == props.disableCateId}
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            props.onOk(item.store_cate_id);
                        }}>{item.name}</Button>
                </List.Item>
            )} />
        </Modal>
    );
};

export default StoreCateListModal;