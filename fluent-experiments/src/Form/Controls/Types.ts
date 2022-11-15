export interface BaseFieldProps {
  value: any;
  onChange: (newValue: any) => void;
  error?: any;
  label: string;
}

export interface FormTextFieldProps extends BaseFieldProps {}
