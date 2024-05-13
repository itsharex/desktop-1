//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { Button, List } from "antd";
import { useStores } from "@/hooks";
import type { ResourceInfo } from "@/api/skill_resource";
import { list as list_resource, RESOURCE_ARTICLE, RESOURCE_EVAL, RESOURCE_MANUAL, RESOURCE_VIDEO } from "@/api/skill_resource";
import { request } from "@/utils/request";
import { open as shell_open } from '@tauri-apps/api/shell';


const ResourceList = () => {
    const userStore = useStores('userStore');
    const skillCenterStore = useStores('skillCenterStore');

    const [resourceList, setResourceList] = useState<ResourceInfo[]>([]);

    const loadResourceList = async () => {
        if (skillCenterStore.curCateId == "") {
            setResourceList([]);
            return;
        }
        const res = await request(list_resource({
            session_id: userStore.sessionId,
            cate_id: skillCenterStore.curCateId,
        }));
        setResourceList(res.resource_list);
    };

    useEffect(() => {
        loadResourceList();
    }, [skillCenterStore.curCateId]);

    return (
        <List rowKey="resource_id" dataSource={resourceList} pagination={false}
            grid={{ gutter: 16 }} style={{ padding: "0px 10px" }}
            renderItem={item => (
                <List.Item style={{ backgroundColor: "#eee", padding: "10px 10px", margin: "4px 4px", borderRadius: "10px" }}>
                    <Button type="link"
                        style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0, padding: "0px 0px" }}
                        title={item.link_url}
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            shell_open(item.link_url);
                        }}>{item.title}(
                        <span>
                            {item.resource_type == RESOURCE_ARTICLE && "文章"}
                            {item.resource_type == RESOURCE_VIDEO && "视频"}
                            {item.resource_type == RESOURCE_MANUAL && "参考手册"}
                            {item.resource_type == RESOURCE_EVAL && "能力评测"}
                        </span>
                        )</Button>
                </List.Item>
            )} />
    );
};

export default observer(ResourceList);