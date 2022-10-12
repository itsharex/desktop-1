import type { InputNumberProps as AntdInputNumberProps } from 'antd';
import { InputNumber as AntdInputNumber } from 'antd';
import type { FC } from 'react';
import React from 'react';

type InputNumberProps = AntdInputNumberProps;

const InputNumber: FC<InputNumberProps> = ({ ...props }) => {
  return (
    <AntdInputNumber
      style={{ width: 150 }}
      placeholder={props.placeholder}
      formatter={(value) => String(value).replace(/^(-)*(\d+)\.(\d).*$/, '$1$2.$3')}
      controls={false}
      addonAfter={props.addonAfter}
      {...props}
    />
  );
};

export default InputNumber;
