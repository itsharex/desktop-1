//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { Divider, Form, InputNumber, Modal } from "antd";
import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { FILE_OWNER_TYPE_NONE } from "@/api/fs";
import { add_learn_record, update_learn_record, get_my_learn_record } from "@/api/skill_learn";
import { useCommonEditor, get_content_text } from "@/components/Editor";
import { useStores } from "@/hooks";
import { request } from "@/utils/request";

const SPACE_REG = /\s+/g;

export interface EditLearnRecordModalProps {
    cateId: string;
    pointId: string;
    update: boolean;
    onCancel: () => void;
    onOk: () => void;
}

const EditLearnRecordModal = (props: EditLearnRecordModalProps) => {
    const userStore = useStores("userStore");

    const [learnHour, setLearnHour] = useState(4);
    const [learnedCount, setLearnedCount] = useState(0);

    const [hasLoad, setHasLoad] = useState(false);

    const learnedEditor = useCommonEditor({
        content: "",
        fsId: "",
        ownerType: FILE_OWNER_TYPE_NONE,
        ownerId: "",
        projectId: "",
        historyInToolbar: false,
        clipboardInToolbar: false,
        commonInToolbar: false,
        widgetInToolbar: false,
        showReminder: false,
    });

    const updateCount = () => {
        const learnedContent = learnedEditor.editorRef.current?.getContent() ?? { type: "doc" };
        const learnedText = get_content_text(learnedContent).replaceAll(SPACE_REG, "");
        setLearnedCount(learnedText.length);
    };

    const loadLearnRecord = async () => {
        if (hasLoad) {
            return;
        }
        setHasLoad(true);
        const res = await request(get_my_learn_record({
            session_id: userStore.sessionId,
            cate_id: props.cateId,
            point_id: props.pointId,
        }));
        setLearnHour(res.record_info.learn_hour);
        learnedEditor.editorRef.current?.setContent(res.record_info.my_learned_content);
    };

    const addLearnRecord = async () => {
        const learnedContent = learnedEditor.editorRef.current?.getContent() ?? { type: "doc" };
        await request(add_learn_record({
            session_id: userStore.sessionId,
            cate_id: props.cateId,
            point_id: props.pointId,
            my_learned_content: JSON.stringify(learnedContent),
            my_learned_len: learnedCount,
            learn_hour: learnHour,
        }));
        await userStore.updateLearnState(userStore.sessionId);
        props.onOk();
    };

    const updateLearnRecord = async () => {
        const learnedContent = learnedEditor.editorRef.current?.getContent() ?? { type: "doc" };
        await request(update_learn_record({
            session_id: userStore.sessionId,
            cate_id: props.cateId,
            point_id: props.pointId,
            my_learned_content: JSON.stringify(learnedContent),
            my_learned_len: learnedCount,
            learn_hour: learnHour,
        }));
        props.onOk();
    };

    useEffect(() => {
        if (props.update && learnedEditor.editorRef.current != null) {
            loadLearnRecord();
        }
    }, [props.update, learnedEditor.editorRef.current, props.pointId]);

    useEffect(() => {
        const timer = setInterval(() => updateCount(), 200);
        return () => {
            clearInterval(timer);
        };
    }, []);

    return (
        <Modal open title={props.update ? "修改学习记录" : "点亮技能"}
            width={600}
            okText={props.update ? "修改" : "点亮"}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                if (props.update) {
                    updateLearnRecord();
                } else {
                    addLearnRecord();
                }
            }}
        >
            <Form>
                <Form.Item label="学习时间">
                    <InputNumber addonAfter="小时" controls={false} min={1} max={99} precision={0} value={learnHour}
                        onChange={value => setLearnHour(value ?? 4)} />
                </Form.Item>
            </Form>
            <Divider orientation="left">可选内容(学习材料和学习心得超过100字可变点赞)</Divider>
            <Form>
                <Form.Item label="学习心得" help={
                    <div style={{ display: "flex", width: "100%", justifyContent: "flex-end" }}>
                        <div>总共{learnedCount}字</div>
                    </div>
                }>
                    <div className="_skillLearnContext">
                        {learnedEditor.editor}
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
};


export default observer(EditLearnRecordModal);