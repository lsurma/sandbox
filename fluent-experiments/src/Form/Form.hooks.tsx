import { FormStateErrors, UseForm, UseFormProps } from "./Form.types";

export const useForm = (props: UseFormProps): UseForm => {
  const getValue = (fieldPath: string, defaultValue?: any) => {
    return props.state.data?.[fieldPath] ?? defaultValue;
  };

  const getError = (fieldPath: string) => {
    let errors = props.state.errors[fieldPath];
    errors = errors ? errors.filter((e) => e) : [];
    return errors?.[0];
  };

  const setValue = (fieldPath: string, newValue?: any) => {
    props.setState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [fieldPath]: newValue,
      },
    }));
  };

  return {
    setErrors: (errors?: Record<string, string[]>) => {
      const normalizedErrors: FormStateErrors = {};

      if (errors) {
        for (const path of Object.keys(errors)) {
          const fieldErrors = errors?.[path];

          if (fieldErrors && Array.isArray(fieldErrors)) {
            normalizedErrors[path] = fieldErrors;
          }
        }
      }

      props.setState((prev) => ({
        ...prev,
        errors: normalizedErrors,
      }));
    },

    register: (fieldPath: string, defaultValue?: any) => {
      defaultValue ??= "";

      return {
        value: getValue(fieldPath, defaultValue),
        error: getError(fieldPath),
        onChange: (newValue: any) => {
          setValue(fieldPath, newValue);
        },
      };
    },
  };
};
