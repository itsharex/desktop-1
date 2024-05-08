//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import {
    command,
    extension,
    NodeExtension,
    ExtensionTag,
    omitExtraAttributes,
    getTextSelection
} from '@remirror/core';
import type { ApplySchemaAttributes, NodeSpecOverride, NodeExtensionSpec, CommandFunction, PrimitiveSelection } from '@remirror/core';
import type { ComponentType } from 'react';
import type { NodeViewComponentProps } from '@remirror/react';
import React from 'react';
import { DockerTplRef } from './DockerTplRefComponent';


export interface DockerTplRefOptions {}

@extension<DockerTplRefOptions>({ defaultOptions: {} })
export class DockerTplRefExtension extends NodeExtension<DockerTplRefOptions> {
    get name() {
        return 'dockerTplRef' as const;
    }

    createTags() {
        return [ExtensionTag.InlineNode];
    }

    createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
        return {
            inline: true,
            draggable: true,
            selectable: false,
            atom: true,
            ...override,
            attrs: {
                ...extra.defaults(),
                dockerAppId: { default: '' },
            },
            toDOM: (node) => {
                const attrs = omitExtraAttributes(node.attrs, extra);
                return ['div', { ...extra.dom(node), ...attrs }];
            },
        };
    }

    @command()
    insertDockerTplRef(dockerAppId: string, selection?: PrimitiveSelection): CommandFunction {
        return ({ tr, dispatch }) => {
            const { from, to } = getTextSelection(selection ?? tr.selection, tr.doc);
            const node = this.type.create({
                dockerAppId: dockerAppId,
            } as DockerTplRefAttributes);
            dispatch?.(tr.replaceRangeWith(from, to, node));
            return true;
        }
    }

    @command()
    deleteDockerTplRef(pos: number): CommandFunction {
        return ({ tr, state, dispatch }) => {
            const node = state.doc.nodeAt(pos);

            if (node && node.type === this.type) {
                tr.delete(pos, pos + 1).scrollIntoView();
                dispatch?.(tr);
                return true;
            }

            return false;
        };
    }

    ReactComponent: ComponentType<NodeViewComponentProps> = (props) => {
        const attrs = props.node.attrs as unknown as DockerTplRefAttributes;
        return <DockerTplRef {...props} dockerAppId={attrs.dockerAppId} />
    };
}

export interface DockerTplRefAttributes {
    dockerAppId: string;
}