import type { FC } from 'react';
import React from 'react';
import s from './EditorWrap.module.less';
import Deletesvg from '@/assets/svg/delete.svg?react';
import classNames from 'classnames';
import { EditOutlined } from '@ant-design/icons';

type EditorWrapProps = {
  onChange?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onEdit?: () => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
};

const EditorWrap: FC<EditorWrapProps> = (props) => {
  const { children, onChange, onEdit, className } = props;

  return (
    <div>
      <div
        className={classNames(s.editor_wrap, className)}
        style={{ ...props.style }}
      >
        {onChange && (
          <div
            className={s.delete}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChange(e);
            }}
          >
            <Deletesvg />
          </div>
        )}
        {onEdit && (
          <div
            className={s.edit}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit();
            }}
            >
            <EditOutlined />
          </div>
        )}
        { }
        {children}
      </div>
    </div>
  );
};

export default EditorWrap;
