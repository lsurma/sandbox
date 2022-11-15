import { useEffect, useId, useMemo, useRef } from "react";
import { useSetRecoilState } from "recoil";
import { createDialogPresets } from "./Dialog.presets";
import { dialogsState } from "./Dialog.states";
import {
  DialogStateDefinition,
  UseBaseDialogProps,
  UseDialogProps,
} from "./Dialog.types";

const useBaseDialog = (props: UseBaseDialogProps) => {
  const setItems = useSetRecoilState(dialogsState);
  const id = useId();

  const closeAction = (stateKey?: string, customProperties?: any) => {
    setItems((items) => {
      const item = { ...items[id] };
      if (!stateKey || item.currentStateKey == stateKey) {
        item.open = false;
        item.currentStateKey = stateKey;
        item.customProperties = customProperties;
      }

      return {
        ...items,
        [id]: item,
      };
    });
  };

  useEffect(() => {
    // Register dialog
    setItems((items) => {
      const current = { ...items[id] };

      return {
        ...items,
        [id]: {
          id: id,
          open: props.open ?? current?.open ?? false,
          currentStateKey:
            props.currentStateKey ?? current?.currentStateKey ?? undefined,
          states: props.states,
          onDismiss: () => closeAction(),
        },
      };
    });
  }, [props]);

  useEffect(() => {
    return () => {
      setItems((items) => {
        const newState = { ...items };

        delete newState[id];

        return newState;
      });
    };
  }, []);

  return {
    open: (stateKey: string, customProperties?: any) => {
      setItems((items) => {
        const item = { ...items[id] };
        item.open = true;
        item.currentStateKey = stateKey;
        item.customProperties = customProperties;

        return {
          ...items,
          [id]: item,
        };
      });
    },

    close: closeAction,
  };
};

export const useDialog = (props: UseDialogProps) => {
  const dialogOpenTimeoutRef = useRef<number | undefined>(undefined);

  const baseDialogProps = useMemo(() => {
    const statesWithPresets: DialogStateDefinition[] = [
      ...createDialogPresets({ useDialogProps: props }),
      ...(props.states ?? []),
    ];

    return {
      states: statesWithPresets,
      open: props.open,
      currentStateKey: props.currentStateKey,
    };
  }, [props]);

  const baseDialog = useBaseDialog(baseDialogProps);

  const openAction = (stateKey: string, customProperties?: any) => {
    clearTimeout(dialogOpenTimeoutRef.current);
    dialogOpenTimeoutRef.current = undefined;
    baseDialog.open(stateKey, customProperties);
  };

  const closeAction = (stateKey?: string, customProperties?: any) => {
    clearTimeout(dialogOpenTimeoutRef.current);
    dialogOpenTimeoutRef.current = undefined;

    baseDialog.close(stateKey, customProperties);
  };

  useEffect(() => {
    if (props.inProgressDialog && !dialogOpenTimeoutRef.current) {
      dialogOpenTimeoutRef.current = setTimeout(() => {
        openAction("inProgress", {
          text: props.inProgressDialogText,
        });
      }, 150);
    } else {
      closeAction("inProgress");
    }

    return () => {
      clearTimeout(dialogOpenTimeoutRef.current);
    };
  }, [props.inProgressDialog]);

  return {
    confirm: (onConfirm: () => void) => {
      openAction("defaultConfirmation", {
        onConfirmCallback: onConfirm,
      });
    },

    open: openAction,
  };
};
