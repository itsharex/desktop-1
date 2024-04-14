import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { Button, Card, List, Space } from "antd";
import type { LearnRecordInfo } from "@/api/skill_learn";
import { list_learn_record, vote, cancel_vote } from "@/api/skill_learn";
import { request } from "@/utils/request";
import { useStores } from "@/hooks";
import UserPhoto from "@/components/Portrait/UserPhoto";
import moment from "moment";
import { LikeFilled, LikeOutlined } from "@ant-design/icons";
import { ReadOnlyEditor } from "@/components/Editor";

const PAGE_SIZE = 10;

export interface PointLearnRecordListProps {
    cateId: string;
    pointId: string;
    dataVersion: number;
}

const PointLearnRecordList = (props: PointLearnRecordListProps) => {
    const userStore = useStores("userStore");

    const [recordList, setRecordList] = useState<LearnRecordInfo[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);

    const loadRecordList = async () => {
        const res = await request(list_learn_record({
            session_id: userStore.sessionId,
            cate_id: props.cateId,
            point_id: props.pointId,
            offset: PAGE_SIZE * curPage,
            limit: PAGE_SIZE,
        }));
        setTotalCount(res.total_count);
        setRecordList(res.record_list);
    };

    const cancelVoteRecord = async (learnUserId: string) => {
        await request(cancel_vote({
            session_id: userStore.sessionId,
            cate_id: props.cateId,
            point_id: props.pointId,
            learn_user_id: learnUserId,
        }));
        const tmpList = recordList.slice();
        const index = tmpList.findIndex(item => item.user_id == learnUserId);
        if (index == -1) {
            return;
        }
        tmpList[index].my_vote = false;
        if (tmpList[index].vote_count > 0) {
            tmpList[index].vote_count -= 1;
        }
        setRecordList(tmpList);
    };

    const voteRecord = async (learnUserId: string) => {
        await request(vote({
            session_id: userStore.sessionId,
            cate_id: props.cateId,
            point_id: props.pointId,
            learn_user_id: learnUserId,
        }));
        const tmpList = recordList.slice();
        const index = tmpList.findIndex(item => item.user_id == learnUserId);
        if (index == -1) {
            return;
        }
        tmpList[index].my_vote = true;
        tmpList[index].vote_count += 1;
        setRecordList(tmpList);
    };

    useEffect(() => {
        if (curPage != 0) {
            setCurPage(0);
        } else {
            loadRecordList();
        }
    }, [props.dataVersion, props.cateId, props.pointId]);

    useEffect(() => {
        loadRecordList();
    }, [curPage]);

    return (
        <List rowKey="user_id" dataSource={recordList}
            pagination={{ total: totalCount, pageSize: PAGE_SIZE, current: curPage + 1, onChange: page => setCurPage(page - 1), showSizeChanger: false, hideOnSinglePage: true }}
            renderItem={item => (
                <List.Item>
                    <Card title={
                        <Space>
                            <UserPhoto logoUri={item.user_logo_uri} style={{ width: "16px", borderRadius: "10px" }} />
                            {item.user_display_name}在{moment(item.create_time).format("YYYY-MM-DD HH:mm")}花费{item.learn_hour}小时学会此技能。
                        </Space>
                    } style={{ width: "100%" }} bordered={false} headStyle={{ backgroundColor: "#eee" }}
                        bodyStyle={{ padding: (item.learn_material_len + item.my_learned_len) > 0 ? "10px 10px" : "0px 0px" }}
                        extra={
                            <>
                                {userStore.userInfo.userId != item.user_id && (item.learn_material_len + item.my_learned_len) > 100 && (
                                    <Button type="link" icon={item.my_vote ? <LikeFilled /> : <LikeOutlined />}
                                        style={{ fontSize: "16px" }}
                                        onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            if (item.my_vote) {
                                                cancelVoteRecord(item.user_id);
                                            } else {
                                                voteRecord(item.user_id);
                                            }
                                        }}>&nbsp;{item.vote_count}</Button>

                                )}
                            </>
                        }>
                        {item.learn_material_len > 0 && (
                            <>
                                <h1 style={{ fontSize: "16px", fontWeight: 700 }}>学习材料</h1>
                                <ReadOnlyEditor content={item.learn_material_content} />
                            </>
                        )}
                        {item.my_learned_len > 0 && (
                            <>
                                <h1 style={{ fontSize: "16px", fontWeight: 700 }}>学习心得</h1>
                                <ReadOnlyEditor content={item.my_learned_content} />
                            </>
                        )}
                    </Card>
                </List.Item>
            )} />
    );
};

export default observer(PointLearnRecordList);