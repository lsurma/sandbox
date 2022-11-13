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
      dialogProps: {
        modalProps: {
          isBlocking: true,
        },

        dialogContentProps: {
          type: DialogType.normal,
          title: "Start",
          subText: "X",
        },
      },

      actions: [
        {
          inProgress: inProgress,
          text: "Send",
          onClick: () => {},
        },
      ],
    },

    {
      key: "defaultConfirmation",
      dialogProps: {
        modalProps: {
          isBlocking: true,
        },

        dialogContentProps: {
          type: DialogType.normal,
          title: "Are you sure?",
          subText: "Are you sure?",
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
    },

    {
      key: "thanks",
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
    },

    {
      key: "inProgress",
      dialogProps: {
        modalProps: {
          isBlocking: true,
          isClickableOutsideFocusTrap: false,
        },

        children: <Spinner />,

        dialogContentProps: {
          type: DialogType.close,
          title: "",
          subText: "",
        },
      },
    },
  ];
};
