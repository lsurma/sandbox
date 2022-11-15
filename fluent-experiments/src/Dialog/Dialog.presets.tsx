import { DialogType, Spinner } from "@fluentui/react";
import * as React from "react";
import { atom } from "recoil";
import {
  CreateDialogPresetsProps,
  DialogState,
  DialogStateDefinition,
  UseDialogProps,
} from "./Dialog.types";

export const createDialogPresets = (
  props: CreateDialogPresetsProps
): DialogStateDefinition[] => {
  const inProgress = props.useDialogProps.inProgress ?? false;

  return [
    {
      key: "1",
      getProps: () => ({
        dialogProps: {
          modalProps: {
            isBlocking: true,
          },

          dialogContentProps: {
            type: DialogType.normal,
            title: "Start",
            subText: "X",
            showCloseButton: true,
          },
        },

        actions: [
          {
            inProgress: inProgress,
            text: "Send",
            onClick: () => {},
          },
        ],
      }),
    },

    {
      key: "defaultConfirmation",
      getProps: () => ({
        dialogProps: {
          modalProps: {},

          dialogContentProps: {
            type: DialogType.normal,
            title: "Are you sure?",
            subText: "Are you sure?",
            showCloseButton: true,
          },
        },

        actions: [
          {
            inProgress: inProgress,
            text: "Yes",
            onClick: (dialogState) => {
              if (dialogState.customProperties.onConfirmCallback) {
                dialogState.customProperties.onConfirmCallback();
              }
            },
          },
        ],
      }),
    },

    {
      key: "thanks",
      getProps: () => ({
        dialogProps: {
          modalProps: {
            isBlocking: false,
            isClickableOutsideFocusTrap: true,
          },

          dialogContentProps: {
            type: DialogType.normal,
            title: "thanks",
            subText: "thanks",
          },
        },
      }),
    },

    {
      key: "inProgress",
      getProps: (dialogState) => ({
        dialogProps: {
          modalProps: {
            isBlocking: true,
            isClickableOutsideFocusTrap: false,
          },

          children: <Spinner />,

          dialogContentProps: {
            type: DialogType.close,
            title: dialogState?.customProperties?.text ?? "",
            subText: "",
          },
        },
      }),
    },
  ];
};
