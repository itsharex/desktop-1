import React, { useEffect, useState } from "react";
import type { LearnSummaryItem } from "@/api/skill_learn";
import { Progress, Tag } from "antd";

export interface SkillSummaryTagProps {
    summaryItem: LearnSummaryItem;
    width?: string;
}

const SkillSummaryTag = (props: SkillSummaryTagProps) => {

    const [ratio, setRatio] = useState(0);

    useEffect(() => {
        if (props.summaryItem.total_point_count > 0) {
            setRatio(Math.round(props.summaryItem.learn_point_count * 100 / props.summaryItem.total_point_count));
        }
    }, []);

    return (
        <Tag style={{ width: props.width ?? "250px", overflow: "hidden", padding: "10px 10px" }}>
            <span style={{ fontSize: "20px", fontWeight: 700 }}>
                {props.summaryItem.cate_name}({props.summaryItem.learn_point_count}/{props.summaryItem.total_point_count})
            </span>
            <br />
            <Progress percent={ratio} />
        </Tag>
    );
}

export default SkillSummaryTag;