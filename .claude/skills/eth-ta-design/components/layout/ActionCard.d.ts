export interface ActionCardProps {
  /** 2-3 char mono badge, e.g. "EX", "PS", "SOL". */
  badge: string;
  label: string;
  name: string;
  status: string;
  available?: boolean;
  href?: string;
  downloadName?: string;
}

export function ActionCard(props: ActionCardProps): JSX.Element;
