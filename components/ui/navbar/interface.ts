import { Dispatch, SetStateAction } from "react";

export type SetBoolean = Dispatch<SetStateAction<boolean>>;

export interface NavbarProps {
  servers: string[];
  setFirstStep: SetBoolean;
  handleClearDataFirstStep: () => void;
  handleClearDataSecondStep: () => void;
}
