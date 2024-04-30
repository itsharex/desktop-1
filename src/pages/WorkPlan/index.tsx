//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React from 'react';
import s from "./index.module.less";
import SpritDetail from './SpritDetail';


const WorkPlan = () => {
    return (
        <div className={s.work_plan_wrap}>
            <SpritDetail />
        </div>
    );
};

export default WorkPlan;