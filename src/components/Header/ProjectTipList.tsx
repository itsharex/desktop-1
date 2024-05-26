//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { useStores } from "@/hooks";
import { Popover } from "antd";
import { PROJECT_SETTING_TAB } from "@/utils/constant";
import s from "./ProjectTipList.module.less";

const ProjectTipList = () => {
    const appStore = useStores('appStore');
    const projectStore = useStores('projectStore');

    const [tipList, setTipList] = useState<string[]>([]);
    const [tipIndex, setTipIndex] = useState(0);

    useEffect(() => {
        if (projectStore.curProjectId == "") {
            setTipList([]);
        } else {
            setTipList(projectStore.curProject?.tip_list ?? []);
            const len = (projectStore.curProject?.tip_list ?? []).length;
            setTipIndex(Math.floor((Math.random() * len)));
        }
    }, [projectStore.curProjectId, projectStore.curProject?.tip_list]);

    useEffect(() => {
        const t = setInterval(() => {
            let tmpList: string[] = [];
            setTipList(value => {
                tmpList = value;
                return value;
            });
            if (tmpList.length > 0) {
                setTipIndex(value => {
                    if (value + 1 >= tmpList.length) {
                        return 0;
                    } else {
                        return value + 1;
                    }
                })
            }
        }, 60 * 1000);
        return () => {
            clearInterval(t);
        };
    });

    return (
        <Popover open={appStore.showHelp || projectStore.showProjectSetting == PROJECT_SETTING_TAB.PROJECT_SETTING_TIPLIST} placement="top"
            content="经验集锦" overlayClassName="global_help">
            <div style={{ width: "calc(100vw - 700px)" }}>
                <div style={{
                    border: (appStore.showHelp || projectStore.showProjectSetting == PROJECT_SETTING_TAB.PROJECT_SETTING_TIPLIST) ? "2px solid orange" : undefined,
                    height: "30px", lineHeight: "20px", padding: "4px 4px", overflow: "hidden", color: "#aaa", fontSize: "14px", fontWeight: 600
                }} >
                    {tipList.length > 0 && tipIndex < tipList.length && (
                        <p className={s.scrollText}>{tipList[tipIndex]}</p>
                    )}
                </div>
            </div>
        </Popover>
    );
};

export default observer(ProjectTipList);