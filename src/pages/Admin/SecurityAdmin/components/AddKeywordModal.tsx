//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useState } from "react";
import { Input, Modal } from "antd";
import { add as add_keyword } from "@/api/keyword_admin";
import { request } from "@/utils/request";
import { get_admin_session } from "@/api/admin_auth";

export interface AddKeywordModalProps {
    onCancel: () => void;
    onOk: () => void;
}

const AddKeywordModal = (props: AddKeywordModalProps) => {
    const [keywordList, setKeywordList] = useState<string[]>([]);

    const addKeywordList = async () => {
        const sessionId = await get_admin_session();
        for (const keyword of keywordList) {
            try {
                await request(add_keyword({
                    admin_session_id: sessionId,
                    keyword: keyword,
                }));
            } catch (e) {
                console.log(e);
            }
        }
        props.onOk();
    };

    return (
        <Modal open title="增加关键词"
            okText="增加" okButtonProps={{ disabled: keywordList.length == 0 }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                addKeywordList();
            }}>
            <Input.TextArea autoSize={{ minRows: 8, maxRows: 8 }} onChange={e => {
                e.stopPropagation();
                e.preventDefault();
                const tmpList = [];
                for (const tmpLine of e.target.value.split("\n")) {
                    const line = tmpLine.trim();
                    if (line == "") {
                        continue;
                    }
                    tmpList.push(line);
                }
                setKeywordList(tmpList);
            }} />
        </Modal>
    );
};

export default AddKeywordModal;