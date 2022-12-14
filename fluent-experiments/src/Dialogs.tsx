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
import { DialogsRenderingRoot } from "./Dialog/Dialog";
import { useDialog } from "./Dialog/Dialog.hooks";
import { SimpleValidator } from "./Validation/SimpleValidator";

const x = new SimpleValidator();

// x.string("key", "key", (x) => [x.required()] )

// x.add("key", (x) => [x.required()]).add("key2", (x) => [x.required]);

const res = x.validate({
  key: "",
  key2: "null",
});

console.log(res);

export const DialogTest = () => {
  const [inProgress, setInProgress] = useState(false);

  const dialog = useDialog({
    // open: inProgress ? true : undefined,
    // currentStateKey: inProgress ? "inProgress" : undefined,
    inProgress: inProgress,
    inProgressDialog: inProgress,
    inProgressDialogText: "test",
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

  const delay = () => {
    setInProgress(true);

    setTimeout(() => {
      setInProgress(false);
    }, 2000);
  };

  return (
    <>
      <button onClick={delay}>in progress delayed</button>
      <button onClick={actionWithConfirmation}>confirm</button>
    </>
  );
};

export const Dialogs = () => {
  return (
    <RecoilRoot>
      <DialogTest />
      <DialogsRenderingRoot />
    </RecoilRoot>
  );
};
