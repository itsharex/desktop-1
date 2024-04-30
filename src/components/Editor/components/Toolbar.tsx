//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React from "react";


export interface ToolbarProps {
    items: JSX.Element[];
};

const Toolbar: React.FC<ToolbarProps> = (props) => {
    return (
        <div role="toolbar" aria-label="Top Toolbar" className="remirror-role remirror-toolbar">
            {props.items.map(item => item)}
        </div>);
}

export default Toolbar;