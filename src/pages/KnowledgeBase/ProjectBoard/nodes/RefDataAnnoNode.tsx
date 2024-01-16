import React, { useEffect, useState } from "react";
import type { NodeProps } from "reactflow";
import { observer } from 'mobx-react';
import { start_update_content, type Node as BoardNode, keep_update_content, end_update_content, update_content, NODE_REF_TYPE_DATA_ANNO } from "@/api/project_board";
import NodeWrap from "./NodeWrap";
import { useStores } from "@/hooks";
import { request } from "@/utils/request";
import { Descriptions, Empty, Modal, Table } from "antd";
import Pagination from "@/components/Pagination";
import type { ColumnsType } from "antd/lib/table";
import { useHistory } from "react-router-dom";
import { LinkDataAnnoInfo } from "@/stores/linkAux";
import type { EntryInfo } from "@/api/project_entry";
import { list as list_entry, get as get_entry,ENTRY_TYPE_DATA_ANNO, ANNO_PROJECT_AUDIO_CLASSIFI, ANNO_PROJECT_AUDIO_SEG, ANNO_PROJECT_AUDIO_TRANS, ANNO_PROJECT_AUDIO_SEG_TRANS, ANNO_PROJECT_IMAGE_CLASSIFI, ANNO_PROJECT_IMAGE_BBOX_OBJ_DETECT, ANNO_PROJECT_IMAGE_BRUSH_SEG, ANNO_PROJECT_IMAGE_CIRCULAR_OBJ_DETECT, ANNO_PROJECT_IMAGE_KEYPOINT, ANNO_PROJECT_IMAGE_POLYGON_SEG, ANNO_PROJECT_TEXT_CLASSIFI, ANNO_PROJECT_TEXT_NER, ANNO_PROJECT_TEXT_SUMMARY } from "@/api/project_entry";

const PAGE_SIZE = 10;

interface SelectAnnoProjectModalProps {
    nodeId: string;
    onClose: () => void;
}

const SelectAnnoProjectModal = (props: SelectAnnoProjectModalProps) => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const entryStore = useStores('entryStore');
    const boardStore = useStores('boardStore');

    const [annProjectList, setAnnProjectList] = useState<EntryInfo[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);

    const loadAnnoProjectList = async () => {
        // const res = await request(list_anno_project({
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
                entry_type_list: [ENTRY_TYPE_DATA_ANNO],
            },
            offset: PAGE_SIZE * curPage,
            limit: PAGE_SIZE,
        }));
        setTotalCount(res.total_count);
        setAnnProjectList(res.entry_list);
    };

    const updateAnnoProjectId = async (annoProjectId: string) => {
        await request(update_content({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            board_id: entryStore.curEntry?.entry_id ?? "",
            node_id: props.nodeId,
            node_data: {
                NodeRefData: {
                    ref_type: NODE_REF_TYPE_DATA_ANNO,
                    ref_target_id: annoProjectId,
                },
            },
        }));
        boardStore.updateNode(props.nodeId);
        props.onClose();
    };

    const columns: ColumnsType<EntryInfo> = [
        {
            title: "名称",
            width: 250,
            render: (_, row: EntryInfo) => (
                <a onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    updateAnnoProjectId(row.entry_id);
                }}>{row.entry_title}</a>
            ),
        },
        {
            title: "标注类型",
            width: 150,
            render: (_, row: EntryInfo) => (
                <>
                    {row.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_AUDIO_CLASSIFI && "音频分类"}
                    {row.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_AUDIO_SEG && "音频分割"}
                    {row.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_AUDIO_TRANS && "音频翻译"}
                    {row.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_AUDIO_SEG_TRANS && "音频分段翻译"}
                    {row.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_IMAGE_CLASSIFI && "图像分类"}
                    {row.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_IMAGE_BBOX_OBJ_DETECT && "矩形对象检测"}
                    {row.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_IMAGE_BRUSH_SEG && "画笔分割"}
                    {row.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_IMAGE_CIRCULAR_OBJ_DETECT && "圆形对象检测"}
                    {row.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_IMAGE_KEYPOINT && "图像关键点"}
                    {row.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_IMAGE_POLYGON_SEG && "多边形分割"}
                    {row.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_TEXT_CLASSIFI && "文本分类"}
                    {row.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_TEXT_NER && "文本命名实体识别"}
                    {row.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_TEXT_SUMMARY && "文本摘要"}
                </>
            ),
        },
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
        loadAnnoProjectList();
    }, [projectStore.curProjectId, curPage]);

    return (
        <Modal open title="选择标注项目" footer={null}
            width={800}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onClose();
            }}>
            <Table
                style={{ marginTop: '8px', maxHeight: "calc(100vh - 300px)", overflowY: "scroll" }}
                rowKey={'anno_project_id'}
                columns={columns}
                scroll={{ x: 600 }}
                dataSource={annProjectList}
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

const RefDataAnnoNode = (props: NodeProps<BoardNode>) => {
    const history = useHistory();

    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const entryStore = useStores('entryStore');
    const linkAuxStore = useStores('linkAuxStore')

    const [showModal, setShowModal] = useState(false);
    const [annoProjectInfo, setAnnoProjectInfo] = useState<EntryInfo | null>(null);

    const loadAnnoProjectInfo = async (annoProjectId: string) => {
        const res = await request(get_entry({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            entry_id: annoProjectId,
        }));
        setAnnoProjectInfo(res.entry);
    };


    useEffect(() => {
        if ((props.data.node_data.NodeRefData?.ref_target_id ?? "") != "") {
            loadAnnoProjectInfo(props.data.node_data.NodeRefData?.ref_target_id ?? "");
        }
    }, [props.data.node_data.NodeRefData?.ref_target_id]);

    return (
        <NodeWrap minWidth={150} minHeight={150} canEdit={entryStore.curEntry?.can_update ?? false} width={props.data.w} height={props.data.h}
            nodeId={props.data.node_id} title="引用数据标注" onEdit={() => setShowModal(true)} bgColor={props.data.bg_color == "" ? "white" : props.data.bg_color}>
            {annoProjectInfo == null && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ margin: "0px 0px" }} />}
            {annoProjectInfo != null && (
                <div>
                    <a onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        linkAuxStore.goToLink(new LinkDataAnnoInfo("", projectStore.curProjectId, annoProjectInfo.entry_id), history);
                    }} style={{ fontSize: "16px", fontWeight: 600 }}>{annoProjectInfo.entry_title}</a>
                    <Descriptions column={1} labelStyle={{ width: "90px" }}>
                        <Descriptions.Item label="标注类型">
                            {annoProjectInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_AUDIO_CLASSIFI && "音频分类"}
                            {annoProjectInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_AUDIO_SEG && "音频分割"}
                            {annoProjectInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_AUDIO_TRANS && "音频翻译"}
                            {annoProjectInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_AUDIO_SEG_TRANS && "音频分段翻译"}
                            {annoProjectInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_IMAGE_CLASSIFI && "图像分类"}
                            {annoProjectInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_IMAGE_BBOX_OBJ_DETECT && "矩形对象检测"}
                            {annoProjectInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_IMAGE_BRUSH_SEG && "画笔分割"}
                            {annoProjectInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_IMAGE_CIRCULAR_OBJ_DETECT && "圆形对象检测"}
                            {annoProjectInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_IMAGE_KEYPOINT && "图像关键点"}
                            {annoProjectInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_IMAGE_POLYGON_SEG && "多边形分割"}
                            {annoProjectInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_TEXT_CLASSIFI && "文本分类"}
                            {annoProjectInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_TEXT_NER && "文本命名实体识别"}
                            {annoProjectInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_TEXT_SUMMARY && "文本摘要"}
                        </Descriptions.Item>
                    </Descriptions>
                </div>
            )}
            {showModal == true && (
                <SelectAnnoProjectModal nodeId={props.data.node_id} onClose={() => setShowModal(false)} />
            )}
        </NodeWrap>
    );
};

export default observer(RefDataAnnoNode);