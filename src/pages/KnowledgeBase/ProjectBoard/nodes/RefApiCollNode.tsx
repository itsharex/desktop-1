import React, { useEffect, useState } from "react";
import type { NodeProps } from "reactflow";
import { observer } from 'mobx-react';
import { start_update_content, type Node as BoardNode, keep_update_content, end_update_content, update_content, NODE_REF_TYPE_API_COLL } from "@/api/project_board";
import NodeWrap from "./NodeWrap";
import { useStores } from "@/hooks";
import { request } from "@/utils/request";
import { Descriptions, Empty, Modal, Table } from "antd";
import Pagination from "@/components/Pagination";
import type { ColumnsType } from "antd/lib/table";
import { useHistory } from "react-router-dom";
import { LinkApiCollInfo } from "@/stores/linkAux";
import type { EntryInfo } from "@/api/project_entry";
import { API_COLL_CUSTOM, API_COLL_GRPC, API_COLL_OPENAPI, ENTRY_TYPE_API_COLL, list as list_entry, get as get_entry } from "@/api/project_entry";

const PAGE_SIZE = 10;

interface SelectApiCollModalProps {
    nodeId: string;
    onClose: () => void;
}

const SelectApiCollModal = (props: SelectApiCollModalProps) => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const entryStore = useStores('entryStore');
    const boardStore = useStores('boardStore');

    const [apiCollList, setApiCollList] = useState<EntryInfo[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);


    const loadApiCollList = async () => {
        // const res = await request(list_apicoll({
        //     session_id: userStore.sessionId,
        //     project_id: projectStore.curProjectId,
        //     filter_by_watch: false,
        //     offset: PAGE_SIZE * curPage,
        //     limit: PAGE_SIZE,
        // }));
        const res = await request(list_entry({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            list_param: {
                filter_by_watch: false,
                filter_by_tag_id: false,
                tag_id_list: [],
                filter_by_keyword: false,
                keyword: "",
                filter_by_mark_remove: true,
                mark_remove: false,
                filter_by_entry_type: true,
                entry_type_list: [ENTRY_TYPE_API_COLL],
            },
            offset: PAGE_SIZE * curPage,
            limit: PAGE_SIZE,
        }));
        setTotalCount(res.total_count);
        setApiCollList(res.entry_list);
    };

    const updateApiCollId = async (apiCollId: string) => {
        await request(update_content({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            board_id: entryStore.curEntry?.entry_id ?? "",
            node_id: props.nodeId,
            node_data: {
                NodeRefData: {
                    ref_type: NODE_REF_TYPE_API_COLL,
                    ref_target_id: apiCollId,
                },
            },
        }));
        boardStore.updateNode(props.nodeId);
        props.onClose();
    };

    const columns: ColumnsType<EntryInfo> = [
        {
            title: "名称",
            width: 200,
            render: (_, row: EntryInfo) => (
                <a onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    updateApiCollId(row.entry_id);
                }}>{row.entry_title}</a>
            ),
        },
        {
            title: "接口类型",
            render: (_, row: EntryInfo) => (
                <>
                    {row.extra_info.ExtraApiCollInfo?.api_coll_type == API_COLL_GRPC && "GRPC"}
                    {row.extra_info.ExtraApiCollInfo?.api_coll_type == API_COLL_OPENAPI && "OPENAPI/SWAGGER"}
                    {row.extra_info.ExtraApiCollInfo?.api_coll_type == API_COLL_CUSTOM && "自定义接口"}
                </>
            ),
        }
    ];

    useEffect(() => {
        request(start_update_content({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            board_id: entryStore.curEntry?.entry_id ?? "",
            node_id: props.nodeId,
        }));
        const timer = setInterval(() => {
            request(keep_update_content({
                session_id: userStore.sessionId,
                project_id: projectStore.curProjectId,
                board_id: entryStore.curEntry?.entry_id ?? "",
                node_id: props.nodeId,
            }));
        }, 30 * 1000);
        return () => {
            clearInterval(timer);
            request(end_update_content({
                session_id: userStore.sessionId,
                project_id: projectStore.curProjectId,
                board_id: entryStore.curEntry?.entry_id ?? "",
                node_id: props.nodeId,
            }));
        };
    }, []);

    useEffect(() => {
        loadApiCollList();
    }, [projectStore.curProjectId, curPage]);

    return (
        <Modal open title="选择流水线" footer={null}
            width={800}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onClose();
            }}>
            <Table
                style={{ marginTop: '8px', maxHeight: "calc(100vh - 300px)", overflowY: "scroll" }}
                rowKey={'api_coll_id'}
                columns={columns}
                scroll={{ x: 600 }}
                dataSource={apiCollList}
                pagination={false}
            />
            <Pagination
                total={totalCount}
                pageSize={PAGE_SIZE}
                current={curPage + 1}
                onChange={(page: number) => setCurPage(page - 1)}
            />
        </Modal>
    );
};

const RefApiCollNode = (props: NodeProps<BoardNode>) => {
    const history = useHistory();

    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const entryStore = useStores('entryStore');
    const linkAuxStore = useStores('linkAuxStore');

    const [showModal, setShowModal] = useState(false);
    const [apiCollInfo, setApiCollInfo] = useState<EntryInfo | null>(null);

    const loadApiCollInfo = async (apiCollId: string) => {
        const res = await request(get_entry({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            entry_id: apiCollId,
        }));
        setApiCollInfo(res.entry);
    };

    useEffect(() => {
        if ((props.data.node_data.NodeRefData?.ref_target_id ?? "") != "") {
            loadApiCollInfo(props.data.node_data.NodeRefData?.ref_target_id ?? "");
        }
    }, [props.data.node_data.NodeRefData?.ref_target_id]);

    return (
        <NodeWrap minWidth={150} minHeight={150} canEdit={entryStore.curEntry?.can_update ?? false} width={props.data.w} height={props.data.h}
            nodeId={props.data.node_id} title="引用接口" onEdit={() => setShowModal(true)} bgColor={props.data.bg_color == "" ? "white" : props.data.bg_color}>
            {apiCollInfo == null && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ margin: "0px 0px" }} />}
            {apiCollInfo != null && (
                <div>
                    <a onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        linkAuxStore.goToLink(new LinkApiCollInfo("", projectStore.curProjectId, apiCollInfo.entry_id), history);
                    }} style={{ fontSize: "16px", fontWeight: 600 }}>{apiCollInfo.entry_title}</a>
                    <Descriptions column={1} labelStyle={{ width: "90px" }}>
                        <Descriptions.Item label="接口类型">
                            {apiCollInfo.extra_info.ExtraApiCollInfo?.api_coll_type == API_COLL_GRPC && "GRPC"}
                            {apiCollInfo.extra_info.ExtraApiCollInfo?.api_coll_type == API_COLL_OPENAPI && "OPENAPI/SWAGGER"}
                            {apiCollInfo.extra_info.ExtraApiCollInfo?.api_coll_type == API_COLL_CUSTOM && "自定义接口"}
                        </Descriptions.Item>
                    </Descriptions>
                </div>
            )}
            {showModal == true && (
                <SelectApiCollModal nodeId={props.data.node_id} onClose={() => setShowModal(false)} />
            )}
        </NodeWrap>
    );
};

export default observer(RefApiCollNode);