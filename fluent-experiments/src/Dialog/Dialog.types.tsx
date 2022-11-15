import { IDialogProps } from "@fluentui/react";

export interface DialogActionDefinition {
  inProgress?: boolean;
  onClick: (dialogState: DialogState) => void;
  text: string;
  variant?: "default" | "primary";
  placement?: "left" | "right";
  key?: string;
}

export interface DialogStateProps {
  dialogProps: IDialogProps;
  actions?: DialogActionDefinition[];
}

export interface DialogStateDefinition {
  key: string;
  getProps: (dialogState: DialogState) => DialogStateProps;
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
  inProgressDialogText?: string;
}

export interface DialogState {
  id: string;
  open: boolean;
  currentStateKey: string | undefined;
  states: DialogStateDefinition[];
  customProperties?: any;
  onDismiss: () => void;
}

export interface CreateDialogPresetsProps {
  useDialogProps: UseDialogProps;
}
