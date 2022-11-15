export type FormStateData = Record<string, any>;
export type FormStateErrors = Record<string, string[]>;

export interface FormState {
  data: FormStateData;
  errors: FormStateErrors;
}

export interface FormControlProps {
  value: any;
  error?: string;
  onChange: (newValue: any) => void;
}

export interface UseFormProps {
  state: FormState;
  setState: (setter: (prevState: FormState) => FormState) => void;
}

export interface UseForm {
  setErrors: (errors?: any) => void;
  register: (fieldPath: string, defaultValue?: any) => FormControlProps;
}
