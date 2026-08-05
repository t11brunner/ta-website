export interface RangeControlProps {
  label: string;
  /** Optional italic serif-weight symbol shown after the label, e.g. "ζ". */
  symbol?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange?: (value: number) => void;
}

export function RangeControl(props: RangeControlProps): JSX.Element;
