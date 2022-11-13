import { DefaultButton, Dialog, DialogFooter } from "@fluentui/react";
import * as React from "react";
import { useRecoilState } from "recoil";
import { dialogsState } from "./Dialog.states";

export const DialogsRenderingRoot = () => {
  const [items, setItems] = useRecoilState(dialogsState);

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
      })}
    </>
  );
};
