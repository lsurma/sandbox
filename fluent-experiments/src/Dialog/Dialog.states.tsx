import { atom } from "recoil";
import { DialogState } from "./Dialog.types";

export const dialogsState = atom<Record<string, DialogState>>({
  key: "_appDialogState",
  default: {},
});
