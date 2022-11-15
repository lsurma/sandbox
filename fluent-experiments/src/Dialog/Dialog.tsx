import {
  DefaultButton,
  Dialog,
  DialogFooter,
  PrimaryButton,
} from "@fluentui/react";
import * as React from "react";
import { useRecoilState } from "recoil";
import { dialogsState } from "./Dialog.states";
import { DialogActionDefinition } from "./Dialog.types";

const Actions = ({ actions }: { actions: DialogActionDefinition[] }) => {
  return (
    <>
      {actions.map((action) => {
        const Component =
          action.variant == "primary" ? PrimaryButton : DefaultButton;
        return (
          <Component
            key={action.key}
            onClick={() => action.onClick}
            text={action.text}
          />
        );
      })}
    </>
  );
};

const DialogFooterActions = ({
  actions,
}: {
  actions: DialogActionDefinition[];
}) => {
  actions = actions.map((action) => {
    action = { ...action };
    action.placement = action.placement ?? "right";
    action.variant = action.variant ?? "primary";
    action.key =
      action.key ?? `${action.text}${action.variant}${action.placement}`;

    return action;
  });

  return (
    <div>
      <div>
        <Actions actions={actions.filter((i) => i.placement == "left")} />
      </div>
      <div>
        <Actions actions={actions.filter((i) => i.placement == "right")} />
      </div>
    </div>
  );
};

export const DialogsRenderingRoot = () => {
  const [items, setItems] = useRecoilState(dialogsState);

  return (
    <>
      {Object.keys(items).map((id) => {
        const item = items[id];
        const stateDefinition = item.states.find(
          (stateItem) => stateItem.key == item.currentStateKey
        );

        if (!stateDefinition) {
          return;
        }

        const props = stateDefinition.getProps(item);
        let footerWithActions = null;

        if (props.actions && props.actions.length > 0) {
          footerWithActions = <DialogFooterActions actions={props.actions} />;
        }

        return (
          <Dialog
            {...props.dialogProps}
            key={item.id}
            hidden={!item.open}
            onDismiss={item.onDismiss}
          >
            {props.dialogProps.children}
            {footerWithActions}
          </Dialog>
        );
      })}
    </>
  );
};
