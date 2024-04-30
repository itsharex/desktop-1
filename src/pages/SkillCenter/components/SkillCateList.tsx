//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { List } from "antd";
import { useStores } from "@/hooks";
import s from "./SkillCateList.module.less";
import classNames from 'classnames';



const SkillCateList = () => {
    const skillCenterStore = useStores('skillCenterStore');
    const [curCateId, setCurCateId] = useState("");

    useEffect(() => {
        setCurCateId(skillCenterStore.curCateId);
    }, [skillCenterStore.curCateId]);

    return (
        <List rowKey="cate_id" dataSource={skillCenterStore.cateList} pagination={false}
            renderItem={item => (
                <List.Item className={classNames(s.item, curCateId == item.cate_id ? s.active : "")}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        skillCenterStore.setCurCateId(item.cate_id);
                    }}>
                    {item.cate_name}
                </List.Item>
            )} />
    );
};

export default observer(SkillCateList);