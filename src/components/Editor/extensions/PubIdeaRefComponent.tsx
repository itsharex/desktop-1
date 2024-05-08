//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from 'react';
import { useCommands } from '@remirror/react';
import type { NodeViewComponentProps } from '@remirror/react';
import type { IdeaInStore } from "@/api/idea_store";
import { list_idea_by_id } from "@/api/idea_store";
import { request } from '@/utils/request';
import EditorWrap from '../components/EditorWrap';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Card, Empty } from 'antd';
import { ReadOnlyEditor } from '../ReadOnlyEditor';


export type PubIdeaRefProps = NodeViewComponentProps & {
    ideaId: string;
};

export const PubIdeaRef = (props: PubIdeaRefProps) => {
    const { deletePubIdeaRef } = useCommands();

    const [ideaInfo, setIdeaInfo] = useState<IdeaInStore | null>(null);

    const removeNode = () => {
        deletePubIdeaRef((props.getPosition as () => number)());
    };

    const loadIdeaInfo = async () => {
        const res = await request(list_idea_by_id({
            idea_id_list: [props.ideaId],
        }));
        if (res.idea_list.length == 1) {
            setIdeaInfo(res.idea_list[0]);
        }
    };

    useEffect(() => {
        loadIdeaInfo();
    }, [props.ideaId]);

    return (
        <ErrorBoundary>
            <EditorWrap onChange={props.view.editable ? () => removeNode() : undefined}
                style={{ width: "100%" }}>
                {ideaInfo == null && (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
                {ideaInfo != null && (
                    <Card title={ideaInfo.basic_info.title} style={{ width: "100%", marginBottom: "10px" }} headStyle={{ backgroundColor: "#eee" }}>
                        <div className='_chatContext'>
                            <ReadOnlyEditor content={ideaInfo.basic_info.content} />
                        </div>
                    </Card>
                )}
            </EditorWrap>
        </ErrorBoundary>
    );
};