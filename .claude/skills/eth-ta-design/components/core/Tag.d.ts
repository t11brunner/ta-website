import { ReactNode } from 'react';

export interface TagProps {
  children: ReactNode;
  /** Default 'accent'. */
  tone?: 'accent' | 'dim';
}

export function Tag(props: TagProps): JSX.Element;
