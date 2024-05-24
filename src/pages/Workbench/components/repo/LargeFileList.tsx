//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { list_lfs_file } from "@/api/git_wrap";
import { List } from "antd";
import React, { useEffect, useState } from "react";

export interface LargeFileListProps {
    repoPath: string;
}

const LargeFileList = (props: LargeFileListProps) => {
    const [fileList, setFileList] = useState<string[]>([]);

    const loadFileList = async () => {
        const tmpList = await list_lfs_file(props.repoPath);
        setFileList(tmpList);
    };

    useEffect(() => {
        loadFileList();
    }, []);

    return (
        <List dataSource={fileList} pagination={false}
            renderItem={item => (
                <List.Item key={item}>
                    {item}
                </List.Item>
            )} />
    );
}

export default LargeFileList;