import { atom, RecoilRoot, useRecoilState, useSetRecoilState } from "recoil";
import {
  DefaultButton,
  Dialog,
  DialogFooter,
  DialogType,
  IDialogProps,
  PrimaryButton,
  Spinner,
} from "@fluentui/react";
import * as React from "react";
import { useEffect, useId, useState } from "react";

interface DialogActionDefinition {
  inProgress?: boolean;
  onClick: (dialogState: DialogState) => void;
  text: string;
}

interface DialogStateDefinition {
  key: string;
  dialogProps: IDialogProps;
  actions?: DialogActionDefinition[];
}

interface UseDialogProps {
  open?: boolean | undefined;
  currentStateKey?: string | undefined;
  states: DialogStateDefinition[];
}

interface DialogState {
  id: string;
  open: boolean;
  currentStateKey: string | undefined;
  states: DialogStateDefinition[];
  customProperties?: any;
}

const dialogs = atom<Record<string, DialogState>>({
  key: "AppDialogs",
  default: {},
});

export const DialogsRoot = () => {
  const [items, setItems] = useRecoilState(dialogs);
  //
  // const dismiss = (id: string) => {
  //   setItems((items) => {
  //     const item = { ...items[id] };
  //     item.isOpen = false;
  //     return {
  //       ...items,
  //       [id]: item,
  //     };
  //   });
  // };
  //
  // const onConfirm = async (id: string) => {
  //   try {
  //     const item = items[id];
  //
  //     setItems((items) => {
  //       const item = { ...items[id] };
  //       item.inProgress = true;
  //
  //       return {
  //         ...items,
  //         [id]: item,
  //       };
  //     });
  //
  //     // Run callback
  //     if (typeof item.onConfirmed === "function") {
  //       await item.onConfirmed();
  //     }
  //   } catch (e) {
  //     console.error(e);
  //   } finally {
  //     setItems((items) => {
  //       const item = { ...items[id] };
  //       item.inProgress = false;
  //       item.isOpen = false;
  //
  //       return {
  //         ...items,
  //         [id]: item,
  //       };
  //     });
  //   }
  // };

  return (
    <>
      {Object.keys(items).map((id) => {
        const item = items[id];
        const state = item.states.find(
          (stateItem) => stateItem.key == item.currentStateKey
        );

        if (!state) {
          return <></>;
        }

        let footerWithActions = null;

        if (state.actions && state.actions.length > 0) {
          footerWithActions = (
            <DialogFooter>
              {state.actions.map((definition) => (
                <DefaultButton
                  disabled={definition.inProgress}
                  onClick={() => definition.onClick(item)}
                  text={definition.text}
                />
              ))}
            </DialogFooter>
          );
        }

        return (
          <Dialog
            {...state.dialogProps}
            key={item.id}
            hidden={!item.open}

            // onDismiss={() => dismiss(id)}
          >
            {state.dialogProps.children}
            {footerWithActions}
          </Dialog>
        );

        // return (
        //   <Dialog
        //     key={item.id}
        //     hidden={false}
        //     modalProps={{
        //       isBlocking: true,
        //     }}
        //     dialogContentProps={{
        //       type: DialogType.normal,
        //       title: "Missing Subject",
        //       subText: "Do you want to send this message without a subject?",
        //     }}
        //     onDismiss={() => dismiss(id)}
        //   >
        //     <DialogFooter>
        //       <DefaultButton
        //         disabled={item.inProgress}
        //         onClick={() => dismiss(id)}
        //         text="Don't send"
        //       />
        //       <PrimaryButton
        //         disabled={item.inProgress}
        //         onClick={() => onConfirm(id)}
        //         text="Send"
        //       />
        //     </DialogFooter>
        //   </Dialog>
        // );
      })}
    </>
  );
};

const useDialog = (props: UseDialogProps) => {
  const setItems = useSetRecoilState(dialogs);
  const id = useId();

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
        },
      };
    });
  }, [props]);

  return {
    confirm: (onConfirm: () => void) => {
      setItems((items) => {
        const item = { ...items[id] };
        item.open = true;
        item.currentStateKey = "defaultConfirmation";

        item.customProperties = {
          onConfirmCallback: onConfirm,
        };

        return {
          ...items,
          [id]: item,
        };
      });
    },

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
  };
};

export const DialogTest = () => {
  const [inProgress, setInProgress] = useState(false);

  const dialog = useDialog({
    // open: inProgress ? true : undefined,
    // currentStateKey: inProgress ? "inProgress" : undefined,

    states: [
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
            onClick: () => setInProgress(true),
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
            isBlocking: true,
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
    ],
  });

  useEffect(() => {
    setTimeout(() => {
      // dialog.open("1");
    }, 500);
  }, []);

  useEffect(() => {
    if (!inProgress) {
      // setTimeout(() => dialog.open("thanks"), 2000);
    }
  }, [inProgress]);

  const actionWithConfirmation = () => {
    dialog.confirm(async () => {
      setInProgress(true);

      await new Promise((resolve, reject) => {
        setTimeout(resolve, 2000);
      });

      setInProgress(false);

      setTimeout(() => {
        dialog.open("thanks");
      }, 1000);
    });
  };

  return (
    <>
      xczc
      <button onClick={actionWithConfirmation}>confirm</button>
    </>
  );
};

export const Dialogs = () => {
  return (
    <RecoilRoot>
      <DialogTest />
      <DialogsRoot />
    </RecoilRoot>
  );
};
