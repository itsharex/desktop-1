//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useState } from "react";
import { useStores } from "@/hooks";
import { Checkbox, Descriptions, Modal, message } from "antd";
import type { RECYCLE_ITEM_TYPE } from "@/api/project_recycle";
import { RECYCLE_ITEM_API_COLL, RECYCLE_ITEM_BOARD, RECYCLE_ITEM_BUG, RECYCLE_ITEM_BULLETIN, RECYCLE_ITEM_DOC, RECYCLE_ITEM_FILE, RECYCLE_ITEM_IDEA, RECYCLE_ITEM_PAGES, RECYCLE_ITEM_REQUIREMENT, RECYCLE_ITEM_SPRIT, RECYCLE_ITEM_TASK, RECYCLE_ITEM_TESTCASE, clear as clear_recycle } from "@/api/project_recycle";
import { request } from "@/utils/request";

export interface ClearModalProps {
    onCancel: () => void;
    onOk: () => void;
}

export const ClearModal = (props: ClearModalProps) => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');

    const [clearIdea, setClearIdea] = useState(false);
    const [clearReq, setClearReq] = useState(false);
    const [clearTask, setClearTask] = useState(false);
    const [clearBug, setClearBug] = useState(false);
    const [clearTestCase, setClearTestCase] = useState(false);
    const [clearBulletin, setClearBulletin] = useState(false);
    const [clearSprit, setClearSprit] = useState(false);
    const [clearDoc, setClearDoc] = useState(false);
    const [clearPages, setClearPages] = useState(false);
    const [clearBoard, setClearBoard] = useState(false);
    const [clearFile, setClearFile] = useState(false);
    const [clearApiColl, setClearApiColl] = useState(false);

    const clearRecycle = async () => {
        const itemTypeList: RECYCLE_ITEM_TYPE[] = [];
        if (clearIdea) {
            itemTypeList.push(RECYCLE_ITEM_IDEA);
        }
        if (clearReq) {
            itemTypeList.push(RECYCLE_ITEM_REQUIREMENT);
        }
        if (clearTask) {
            itemTypeList.push(RECYCLE_ITEM_TASK);
        }
        if (clearBug) {
            itemTypeList.push(RECYCLE_ITEM_BUG);
        }
        if (clearTestCase) {
            itemTypeList.push(RECYCLE_ITEM_TESTCASE);
        }
        if (clearBulletin) {
            itemTypeList.push(RECYCLE_ITEM_BULLETIN);
        }
        if (clearSprit) {
            itemTypeList.push(RECYCLE_ITEM_SPRIT);
        }
        if (clearDoc) {
            itemTypeList.push(RECYCLE_ITEM_DOC);
        }
        if (clearPages) {
            itemTypeList.push(RECYCLE_ITEM_PAGES);
        }
        if (clearBoard) {
            itemTypeList.push(RECYCLE_ITEM_BOARD);
        }
        if (clearFile) {
            itemTypeList.push(RECYCLE_ITEM_FILE);
        }
        if (clearApiColl) {
            itemTypeList.push(RECYCLE_ITEM_API_COLL);
        }

        await request(clear_recycle({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            recycle_item_type_list: itemTypeList,
        }));
        props.onOk();
        message.info("清空成功");
    };

    return (
        <Modal open title="清空回收站"
            okText="清空"
            okButtonProps={{ danger: true, disabled: !(clearIdea || clearReq || clearTask || clearBug || clearTestCase || clearBulletin || clearSprit || clearDoc || clearPages || clearBoard || clearFile || clearApiColl) }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e=>{
                e.stopPropagation();
                e.preventDefault();
                clearRecycle();
            }}>
            <h2>请选择要清除的数据类型:</h2>
            <Descriptions bordered column={3} labelStyle={{ width: "100px" }}>
                <Descriptions.Item label="知识点">
                    <Checkbox checked={clearIdea} onChange={e => {
                        e.stopPropagation();
                        setClearIdea(e.target.checked);
                    }} />
                </Descriptions.Item>
                <Descriptions.Item label="项目需求">
                    <Checkbox checked={clearReq} onChange={e => {
                        e.stopPropagation();
                        setClearReq(e.target.checked);
                    }} />
                </Descriptions.Item>
                <Descriptions.Item label="任务">
                    <Checkbox checked={clearTask} onChange={e => {
                        e.stopPropagation();
                        setClearTask(e.target.checked);
                    }} />
                </Descriptions.Item>
                <Descriptions.Item label="缺陷">
                    <Checkbox checked={clearBug} onChange={e => {
                        e.stopPropagation();
                        setClearBug(e.target.checked);
                    }} />
                </Descriptions.Item>
                <Descriptions.Item label="测试用例">
                    <Checkbox checked={clearTestCase} onChange={e => {
                        e.stopPropagation();
                        setClearTestCase(e.target.checked);
                    }} />
                </Descriptions.Item>
                <Descriptions.Item label="项目公告">
                    <Checkbox checked={clearBulletin} onChange={e => {
                        e.stopPropagation();
                        setClearBulletin(e.target.checked);
                    }} />
                </Descriptions.Item>
                <Descriptions.Item label="工作计划">
                    <Checkbox checked={clearSprit} onChange={e => {
                        e.stopPropagation();
                        setClearSprit(e.target.checked);
                    }} />
                </Descriptions.Item>
                <Descriptions.Item label="项目文档">
                    <Checkbox checked={clearDoc} onChange={e => {
                        e.stopPropagation();
                        setClearDoc(e.target.checked);
                    }} />
                </Descriptions.Item>
                <Descriptions.Item label="静态网页">
                    <Checkbox checked={clearPages} onChange={e => {
                        e.stopPropagation();
                        setClearPages(e.target.checked);
                    }} />
                </Descriptions.Item>
                <Descriptions.Item label="信息面板">
                    <Checkbox checked={clearBoard} onChange={e => {
                        e.stopPropagation();
                        setClearBoard(e.target.checked);
                    }} />
                </Descriptions.Item>
                <Descriptions.Item label="项目文件">
                    <Checkbox checked={clearFile} onChange={e => {
                        e.stopPropagation();
                        setClearFile(e.target.checked);
                    }} />
                </Descriptions.Item>
                <Descriptions.Item label="接口集合">
                    <Checkbox checked={clearApiColl} onChange={e => {
                        e.stopPropagation();
                        setClearApiColl(e.target.checked);
                    }} />
                </Descriptions.Item>
            </Descriptions>
        </Modal>
    );
};

export default ClearModal;