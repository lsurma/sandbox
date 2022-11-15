import { TextField } from "@fluentui/react";
import { FormTextFieldProps } from "./Types";

export const FormTextField = (props: FormTextFieldProps) => {
  return (
    <TextField
      errorMessage={props.error}
      label={props.label}
      value={props.value}
      onChange={(ev, newValue) => props.onChange(newValue)}
    />
  );
};
