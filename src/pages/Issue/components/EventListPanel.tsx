import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { useStores } from "@/hooks";
import type { PluginEvent } from '@/api/events';
import { EVENT_REF_TYPE_BUG, EVENT_REF_TYPE_TASK, EVENT_TYPE_BUG, EVENT_TYPE_TASK } from '@/api/events';
import { request } from "@/utils/request";
import { list_event_by_ref } from '@/api/events';
import { Space, Timeline } from "antd";
import EventCom from "@/components/EventCom";
import moment from "moment";
import UserPhoto from "@/components/Portrait/UserPhoto";
import { ISSUE_TYPE_TASK } from "@/api/project_issue";

const EventListPanel = () => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');

    const [timeLine, setTimeLine] = useState<PluginEvent[]>();

    const loadEvent = async () => {
        const res = await request(list_event_by_ref({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            event_type: projectStore.projectModal.issueType == ISSUE_TYPE_TASK ? EVENT_TYPE_TASK : EVENT_TYPE_BUG,
            ref_type: projectStore.projectModal.issueType == ISSUE_TYPE_TASK ? EVENT_REF_TYPE_TASK : EVENT_REF_TYPE_BUG,
            ref_id: projectStore.projectModal.issueId,
        }));
        setTimeLine(res.event_list);
    }

    useEffect(() => {
        loadEvent();
    }, [projectStore.projectModal.issueId]);

    return (
        <Timeline reverse={true} style={{ paddingTop: "10px" }}>
            {timeLine?.map((item) => (
                <Timeline.Item color="gray" key={item.event_id}>
                    <Space>
                        <UserPhoto logoUri={item.cur_logo_uri} style={{ width: "16px", borderRadius: "10px" }} />
                        <span>
                            {item.cur_user_display_name}({moment(item.event_time).format("YYYY-MM-DD HH:mm:ss")})
                        </span>
                    </Space>
                    <EventCom key={item.event_id} item={item} skipProjectName={true} skipLink={true} showMoreLink={false} />
                </Timeline.Item>
            ))}
        </Timeline>
    );
};

export default observer(EventListPanel);