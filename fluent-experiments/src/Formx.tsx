import { useState } from "react";
import { atom, RecoilRoot, RecoilState, useRecoilState } from "recoil";
import { PrimaryButton, TextField } from "@fluentui/react";
import { FormTextField, useForm } from "./Form";
import { FormState } from "./Form/Form.types";

const bigState = atom({
  key: "bigStateAtom",
  default: {},
});

const connectState = (
  stateKey: string,
  state: any,
  stateSetter: (current: any) => any
) => {
  return {
    state: state[stateKey],
    setState: (setter: (prevState: FormState) => FormState) => {
      stateSetter((current: any) => {
        let newState = { ...current };
        newState[stateKey] = setter(newState[stateKey]);
        return newState;
      });
    },
  };
};

// generateSetter(setLocalState, 'simpleForm')

const FormInner = () => {
  const [state, setState] = useRecoilState(bigState);

  const [localState, setLocalState] = useState<any>({
    simpleForm: {
      data: {},
      errors: {},
    },
  });

  const form = useForm({
    ...connectState("simpleForm", localState, setLocalState),
  });

  return (
    <>
      <PrimaryButton
        text={"test"}
        onClick={() => {
          form.setErrors({
            name: ["a"],
          });
        }}
      />

      <FormTextField label={"Name"} {...form.register("name")} />
    </>
  );
};

export const Formx = () => {
  return (
    <RecoilRoot>
      <FormInner />
    </RecoilRoot>
  );
};
