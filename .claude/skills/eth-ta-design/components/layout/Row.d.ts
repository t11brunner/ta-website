import { ReactNode } from 'react';

export interface RowProps {
  number: string | number;
  title: string;
  meta: string;
  /** Rendered Tag elements shown before the arrow. */
  tags?: ReactNode;
  onClick?: () => void;
}

export function Row(props: RowProps): JSX.Element;
