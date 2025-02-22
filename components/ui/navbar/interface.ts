import type { Dispatch, SetStateAction } from "react";

export type SetBoolean = Dispatch<SetStateAction<boolean>>;

export interface NavbarProps {
  servers: string[];
  setFirstStep: SetBoolean;
  setAllowNavigation: SetBoolean;
  handleClearDataFirstStep: () => void;
  handleClearDataSecondStep: () => void;
}
