//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import BoardEditor from './BoardEditor';

const ProjectBoard = () => {
    return (
        <DndProvider backend={HTML5Backend}>
            <BoardEditor />
        </DndProvider>
    );
};


export default ProjectBoard;

