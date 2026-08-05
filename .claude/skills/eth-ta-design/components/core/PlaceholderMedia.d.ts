import { CSSProperties } from 'react';

export interface PlaceholderMediaProps {
  /** Lowercase caption shown centered, e.g. a demo's name. */
  label?: string;
  height?: number;
  style?: CSSProperties;
}

export function PlaceholderMedia(props: PlaceholderMediaProps): JSX.Element;
