import { ReactNode } from "react";

export interface AuthModalProps {
  children?: ReactNode;
  onToggle: () => void;
}
