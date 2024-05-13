//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { List } from "antd";
import { useStores } from "@/hooks";
import type { SkillQuestion } from "@/api/skill_test";
import { list_question } from "@/api/skill_test";
import { request } from "@/utils/request";
import { ReadOnlyEditor } from "@/components/Editor";

const PAGE_SIZE = 10;

const QuestionList = () => {
    const userStore = useStores('userStore');
    const skillCenterStore = useStores('skillCenterStore');

    const [questionList, setQuestionList] = useState<SkillQuestion[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);

    const loadQuestionList = async () => {
        if (skillCenterStore.curCateId == "") {
            setQuestionList([]);
            return;
        }
        const res = await request(list_question({
            session_id: userStore.sessionId,
            cate_id: skillCenterStore.curCateId,
            offset: curPage * PAGE_SIZE,
            limit: PAGE_SIZE,
        }));
        setQuestionList(res.question_list);
        setTotalCount(res.total_count);
    };

    useEffect(() => {
        loadQuestionList();
    }, [curPage]);

    useEffect(() => {
        if (curPage != 0) {
            setCurPage(0);
        } else {
            loadQuestionList();
        }
    }, [skillCenterStore.curCateId]);

    return (
        <List rowKey="question_id" dataSource={questionList}
            style={{ padding: "10px 10px" }}
            pagination={{ current: curPage + 1, total: totalCount, pageSize: PAGE_SIZE, onChange: page => setCurPage(page - 1), hideOnSinglePage: true, showSizeChanger: false }}
            renderItem={item => (
                <List.Item style={{ backgroundColor: "#f0f0f0", padding: "10px",marginBottom:"10px" }}>
                    <ReadOnlyEditor content={item.content} />
                </List.Item>
            )} />
    );
};

export default observer(QuestionList);