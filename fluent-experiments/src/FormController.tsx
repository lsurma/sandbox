import { useEffect, useMemo, useRef, useState } from "react";
import { Panel, PanelType, PrimaryButton, TextField } from "@fluentui/react";

interface FormController
{
  inProgress : boolean;
  submit : () => PromiseLike<any>;
  registerSubmit : (callback : () => PromiseLike<any>) => void;
}

const useFormController = () : FormController => {
  const submitCallbackRef = useRef<null | (() => PromiseLike<any>)>(null)
  const [inProgress, setInProgress] = useState(false);

  const api = {
    inProgress,

    registerSubmit : (callback : () => PromiseLike<any>) => {
      submitCallbackRef.current = callback;
    },

    submit : async () => {
      if(!submitCallbackRef.current) {
        throw new Error("No submit function registered");
      }

      console.log("Ctrl:start");
      setInProgress(true);
      await submitCallbackRef.current();
      setInProgress(false);
      console.log("Ctrl:end");
    }
  };

  return api;
}

const Form = (props : { formController ?: FormController }) => {
  const [inProgress, setInProgress] = useState(false);
  const [value, setValue] = useState<string | undefined>("");

  const submitFunction = async () => {
    console.log("submitFunction:start");
    setInProgress(true);
    console.log(value);
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    })
    setInProgress(false);
    console.log("submitFunction:end");
  }

  const submit = async () => {
    if(props.formController) {
      await props.formController.submit();
      return;
    }

    await submitFunction();
  }

  useEffect(() => {
    // Attach submit callback to form controller
    props.formController && props.formController.registerSubmit(submitFunction);
  }, [value])

  const submitInProgress = props.formController ? props.formController.inProgress : inProgress;

  return <>
    <TextField value={value} onChange={(e, v) => setValue(v)} />

    <PrimaryButton disabled={submitInProgress} text={"Save inner"} onClick={submit} />

  </>
}

export const FormTest = () => {
  const editorForm = useFormController();

  const outerSave = async () => {
    await editorForm.submit();
  }

  console.log(`FormTest`);

  return <>

    <Panel
      type={PanelType.extraLarge}
      isOpen={true}
      isFooterAtBottom
      onRenderFooterContent={() => {
        return <>
          <PrimaryButton disabled={editorForm.inProgress} text={"Save"} onClick={outerSave} />
        </>
      }}
    >
      <Form  formController={editorForm} />
    </Panel>

  </>
}