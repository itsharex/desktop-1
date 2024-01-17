import React from "react";
import { ANNO_PROJECT_AUDIO_CLASSIFI, ANNO_PROJECT_AUDIO_SEG, ANNO_PROJECT_AUDIO_SEG_TRANS, ANNO_PROJECT_AUDIO_TRANS, ANNO_PROJECT_IMAGE_BBOX_OBJ_DETECT, ANNO_PROJECT_IMAGE_BRUSH_SEG, ANNO_PROJECT_IMAGE_CIRCULAR_OBJ_DETECT, ANNO_PROJECT_IMAGE_CLASSIFI, ANNO_PROJECT_IMAGE_KEYPOINT, ANNO_PROJECT_IMAGE_POLYGON_SEG, ANNO_PROJECT_TEXT_CLASSIFI, ANNO_PROJECT_TEXT_NER, ANNO_PROJECT_TEXT_SUMMARY, API_COLL_CUSTOM, API_COLL_GRPC, API_COLL_OPENAPI, ENTRY_TYPE_API_COLL, ENTRY_TYPE_DATA_ANNO, ENTRY_TYPE_SPRIT, type EntryInfo } from "@/api/project_entry";
import { Descriptions, Space } from "antd";
import { observer } from 'mobx-react';
import { useStores } from "@/hooks";
import UserPhoto from "@/components/Portrait/UserPhoto";
import moment from "moment";

export interface EntryPopoverProps {
    entryInfo: EntryInfo;
}

const EntryPopover = (props: EntryPopoverProps) => {
    const memberStore = useStores('memberStore');

    return (
        <div style={{ width: "240px" }}>
            <Descriptions column={1} bordered labelStyle={{ width: "90px" }}>
                {props.entryInfo.entry_type == ENTRY_TYPE_SPRIT && (
                    <>
                        <Descriptions.Item label="开始时间">
                            {moment(props.entryInfo.extra_info.ExtraSpritInfo?.start_time ?? 0).format("YYYY-MM-DD")}
                        </Descriptions.Item>
                        <Descriptions.Item label="结束时间">
                            {moment(props.entryInfo.extra_info.ExtraSpritInfo?.end_time ?? 0).format("YYYY-MM-DD")}
                        </Descriptions.Item>
                        <Descriptions.Item label="非工作日">
                            {(props.entryInfo.extra_info.ExtraSpritInfo?.non_work_day_list ?? []).map(day => (
                                <div key={day}>{moment(day).format("YYYY-MM-DD")}</div>
                            ))}
                        </Descriptions.Item>
                    </>
                )}
                {props.entryInfo.entry_type == ENTRY_TYPE_API_COLL && (
                    <>
                        <Descriptions.Item label="接口类型">
                            {props.entryInfo.extra_info.ExtraApiCollInfo?.api_coll_type == API_COLL_GRPC && "GRPC接口"}
                            {props.entryInfo.extra_info.ExtraApiCollInfo?.api_coll_type == API_COLL_OPENAPI && "OPENAPI接口"}
                            {props.entryInfo.extra_info.ExtraApiCollInfo?.api_coll_type == API_COLL_CUSTOM && "自定义接口"}
                        </Descriptions.Item>
                        <Descriptions.Item label="默认地址">{props.entryInfo.extra_info.ExtraApiCollInfo?.default_addr ?? ""}</Descriptions.Item>
                    </>
                )}
                {props.entryInfo.entry_type == ENTRY_TYPE_DATA_ANNO && (
                    <Descriptions.Item label="标注类型">
                        {props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_AUDIO_CLASSIFI && "音频分类"}
                        {props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_AUDIO_SEG && "音频分割"}
                        {props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_AUDIO_TRANS && "音频翻译"}
                        {props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_AUDIO_SEG_TRANS && "音频分段翻译"}
                        {props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_IMAGE_CLASSIFI && "图像分类"}
                        {props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_IMAGE_BBOX_OBJ_DETECT && "矩形对象检测"}
                        {props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_IMAGE_BRUSH_SEG && "画笔分割"}
                        {props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_IMAGE_CIRCULAR_OBJ_DETECT && "圆形对象检测"}
                        {props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_IMAGE_KEYPOINT && "图像关键点"}
                        {props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_IMAGE_POLYGON_SEG && "多边形分割"}
                        {props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_TEXT_CLASSIFI && "文本分类"}
                        {props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_TEXT_NER && "文本命名实体识别"}
                        {props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_TEXT_SUMMARY && "文本摘要"}
                    </Descriptions.Item>
                )}
                <Descriptions.Item label="修改权限">
                    {props.entryInfo.entry_perm.update_for_all && "全体成员可更新"}
                    {props.entryInfo.entry_perm.update_for_all == false && (
                        props.entryInfo.entry_perm.extra_update_user_id_list.map(userId => memberStore.getMember(userId)).filter(member => member != undefined).map(member => (
                            <div key={member?.member.member_user_id ?? ""} style={{ marginTop: "4px", marginRight: "4px" }}>
                                <UserPhoto logoUri={member?.member.logo_uri ?? ""} style={{ width: "16px", borderRadius: "10px" }} />
                                &nbsp;
                                {member?.member.display_name ?? ""}
                            </div>
                        ))
                    )}
                </Descriptions.Item>
                {props.entryInfo.watch_user_list.length > 0 && (
                    <Descriptions.Item label="关注用户">
                        <Space direction="vertical">
                            {props.entryInfo.watch_user_list.map(watchUser => (
                                <div key={watchUser.member_user_id}>
                                    <UserPhoto logoUri={watchUser.logo_uri} style={{ width: "16px", borderRadius: "10px" }} />
                                    &nbsp;
                                    {watchUser.display_name}
                                </div>
                            ))}
                        </Space>
                    </Descriptions.Item>
                )}
                <Descriptions.Item label="创建用户">
                    <UserPhoto logoUri={props.entryInfo.create_logo_uri} style={{ width: "16px", borderRadius: "10px" }} />
                    &nbsp;
                    {props.entryInfo.create_display_name}
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                    {moment(props.entryInfo.create_time).format("YYYY-MM-DD HH:mm:ss")}
                </Descriptions.Item>
                {props.entryInfo.update_user_id != props.entryInfo.create_user_id && (
                    <Descriptions.Item label="更新用户">
                        <UserPhoto logoUri={props.entryInfo.update_logo_uri} style={{ width: "16px", borderRadius: "10px" }} />
                        &nbsp;
                        {props.entryInfo.update_display_name}
                    </Descriptions.Item>
                )}
                {props.entryInfo.update_time != props.entryInfo.create_time && (
                    <Descriptions.Item label="更新时间">
                        {moment(props.entryInfo.update_time).format("YYYY-MM-DD HH:mm:ss")}
                    </Descriptions.Item>
                )}
            </Descriptions>
        </div>
    );
};

export default observer(EntryPopover);