import { useState } from "react";
import { atom, RecoilRoot, RecoilState, useRecoilState } from "recoil";
import { PrimaryButton, TextField } from "@fluentui/react";
import { FormTextField, useForm } from "./Form";

const bigState = atom({
  key: "bigStateAtom",
  default: {},
});

const FormInner = () => {
  const [state, setState] = useRecoilState(bigState);

  const [localState, setLocalState] = useState<any>({
    simpleForm: {
      data: {},
      errors: {},
    },
  });

  const form = useForm({
    state: localState.simpleForm,
    setState: (setter) => {
      setLocalState((prev: any) => ({
        ...prev,
        simpleForm: setter(prev.simpleForm),
      }));
    },
  });

  return (
    <>
      <PrimaryButton
        text={"test"}
        onClick={() => {
          form.setErrors({});
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
