import { IDialogProps } from "@fluentui/react";

export interface DialogActionDefinition {
  inProgress?: boolean;
  onClick: (dialogState: DialogState) => void;
  text: string;
}

export interface DialogStateDefinition {
  key: string;
  dialogProps: IDialogProps;
  actions?: DialogActionDefinition[];
}

export interface UseBaseDialogProps {
  open?: boolean | undefined;
  currentStateKey?: string | undefined;
  states: DialogStateDefinition[];
}

export interface UseDialogProps {
  open?: boolean | undefined;
  currentStateKey?: string | undefined;
  states?: DialogStateDefinition[];
  inProgress?: boolean;
  inProgressDialog?: boolean;
}

export interface DialogState {
  id: string;
  open: boolean;
  currentStateKey: string | undefined;
  states: DialogStateDefinition[];
  customProperties?: any;
}

export interface CreateDialogPresetsProps {
  useDialogProps: UseDialogProps;
}
