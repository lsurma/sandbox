import { atom, RecoilRoot, RecoilState, useRecoilState } from "recoil";
import { PrimaryButton, TextField } from "@fluentui/react";

const bigState = atom({
  key: "bigStateAtom",
  default: {},
});

const connect = (state: any, path: string[]): FormControlConnector => {
  return {
    value: "xx",
    onChange: (newValue) => {},
  };
};

export interface FormControlConnector {
  value: any;
  onChange: (newValue: any) => void;
}

export interface FormTextFieldProps {
  value: any;
  onChange: (newValue: any) => void;
  error?: any;
}

const FormTextField = (props: FormTextFieldProps) => {
  return (
    <>
      <TextField
        errorMessage={props.error}
        label={"Text"}
        value={props.value}
        onChange={(ev, newValue) => props.onChange(newValue)}
      />
    </>
  );
};

const useRecoilForm = <T,>(recoilState: RecoilState<T>) => {
  const [state, setState] = useRecoilState(recoilState);

  const get = (fieldPath: string) => {
    // @ts-ignore
    return state?.[fieldPath];
  };

  const getError = (fieldPath: string) => {
    // @ts-ignore
    return state?.errors?.[fieldPath];
  };

  return {
    register: (fieldPath: string) => {
      return {
        value: get(fieldPath),
        error: getError(fieldPath),
        onChange: (newValue: any) => {
          setState((c) => {
            return {
              ...c,
              [fieldPath]: newValue,
            };
          });
        },
      };
    },
  };
};

const FormInner = () => {
  const [state, setState] = useRecoilState(bigState);
  const form = useRecoilForm(bigState);

  return (
    <>
      <TextField label={"Text"} />
      <PrimaryButton
        text={"test"}
        onClick={() => {
          setState((c) => {
            return {
              ...c,
              errors: {
                name: "Name field error",
              },
            };
          });
        }}
      />

      <FormTextField {...form.register("name")} />
    </>
  );
};

export const Form = () => {
  return (
    <RecoilRoot>
      <FormInner />
    </RecoilRoot>
  );
};
