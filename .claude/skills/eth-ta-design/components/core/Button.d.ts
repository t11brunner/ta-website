import { ReactNode, CSSProperties, MouseEventHandler } from 'react';

export interface ButtonProps {
  children: ReactNode;
  /** Visual treatment. Default 'primary'. */
  variant?: 'primary' | 'accent' | 'ghost' | 'text';
  /** Size. Default 'md'. */
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  style?: CSSProperties;
}

export function Button(props: ButtonProps): JSX.Element;
