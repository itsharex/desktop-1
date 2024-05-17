//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useState } from "react";
import { Button, Input, Modal, Space } from "antd";
import { test as test_keyword } from "@/api/keyword_admin";
import { request } from "@/utils/request";
import { get_admin_session } from "@/api/admin_auth";

export interface TestKeywordModalProps {
    onCancel: () => void;
}

const TestKeywordModal = (props: TestKeywordModalProps) => {
    const [content, setContent] = useState("");
    const [keywordList, setKeywordList] = useState<string[]>([]);

    const testKeyword = async () => {
        const sessionId = await get_admin_session();
        const res = await request(test_keyword({
            admin_session_id: sessionId,
            content: content,
        }));
        setKeywordList(res.keyword_list);
    };

    return (
        <Modal open title="测试关键词" footer={null}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}>
            <Input.TextArea autoSize={{ minRows: 8, maxRows: 8 }} value={content}
                onChange={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    setContent(e.target.value);
                }} />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px", marginRight: "10px" }}>
                <Button type="primary" onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    testKeyword();
                }}>测试</Button>
            </div>
            <Space style={{ flexWrap: "wrap" }}>
                <div>关键词:</div>
                {keywordList.map(item => (
                    <div>{item}</div>
                ))}
            </Space>
        </Modal>
    );
};

export default TestKeywordModal;