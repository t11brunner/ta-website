export interface NavPillsProps {
  items: { key: string; label: string }[];
  /** Controlled active key; omit to let the component manage its own state. */
  active?: string;
  onChange?: (key: string) => void;
}

export function NavPills(props: NavPillsProps): JSX.Element;
