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
import { PubIdeaRef } from './PubIdeaRefComponent';


export interface PubIdeaRefOptions {}

@extension<PubIdeaRefOptions>({ defaultOptions: {} })
export class PubIdeaRefExtension extends NodeExtension<PubIdeaRefOptions> {
    get name() {
        return 'pubIdeaRef' as const;
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
                ideaId: { default: '' },
            },
            toDOM: (node) => {
                const attrs = omitExtraAttributes(node.attrs, extra);
                return ['div', { ...extra.dom(node), ...attrs }];
            },
        };
    }

    @command()
    insertPubIdeaRef(ideaId: string, selection?: PrimitiveSelection): CommandFunction {
        return ({ tr, dispatch }) => {
            const { from, to } = getTextSelection(selection ?? tr.selection, tr.doc);
            const node = this.type.create({
                ideaId: ideaId,
            } as PubIdeaRefAttributes);
            dispatch?.(tr.replaceRangeWith(from, to, node));
            return true;
        }
    }

    @command()
    deletePubIdeaRef(pos: number): CommandFunction {
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
        const attrs = props.node.attrs as unknown as PubIdeaRefAttributes;
        return <PubIdeaRef {...props} ideaId={attrs.ideaId} />
    };
}

export interface  PubIdeaRefAttributes {
    ideaId: string;
}