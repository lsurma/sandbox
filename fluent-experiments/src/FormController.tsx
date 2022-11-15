import { useEffect, useMemo, useRef, useState } from "react";
import {
  DefaultButton,
  Panel,
  PanelType,
  PrimaryButton,
  TextField,
} from "@fluentui/react";

interface UseStateProxy {
  state: any;
  setState: (setter: (current: any) => void, shouldRerender?: boolean) => void;
}

const useStateProxy = (): UseStateProxy => {
  const stateRef = useRef<any>({});
  const [rerenderToken, setRerenderToken] = useState<undefined | number>(
    undefined
  );

  return {
    state: stateRef.current,
    setState: (setter: (current: any) => void, shouldRerender?: boolean) => {
      setter(stateRef.current);
      if (shouldRerender) {
        setRerenderToken(Math.random());
      }
    },
  };
};

const Form = (props: { proxy?: UseStateProxy }) => {
  const [inProgress, setInProgress] = useState(false);
  const [value, setValue] = useState<string | undefined>("");

  const submitFunction = async () => {
    console.log("submitFunction:start");
    setInProgress(true);
    console.log(value);
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
    setInProgress(false);
    console.log("submitFunction:end");
  };

  const submit = async () => {
    await submitFunction();
  };

  const discard = () => {
    setValue("");
  };

  const setProxyState = (shouldRerender?: boolean) => {
    if (props.proxy) {
      props.proxy.setState((current) => {
        current.inProgress = inProgress;
        current.submit = submitFunction;
        current.discard = discard;
      }, shouldRerender);
    }
  };

  useEffect(() => {
    setProxyState();
  }, [value]);

  useEffect(() => {
    setProxyState(true);
  }, [inProgress]);

  const submitInProgress = inProgress;

  console.log("Inner");

  return (
    <>
      <TextField value={value} onChange={(e, v) => setValue(v)} />

      <PrimaryButton
        disabled={submitInProgress}
        text={"Save inner"}
        onClick={submit}
      />
    </>
  );
};

export const FormTest = () => {
  const proxy = useStateProxy();

  const outerSave = async () => {
    proxy.state.submit();
  };

  console.log("Outer");

  return (
    <>
      <Panel
        type={PanelType.extraLarge}
        isOpen={true}
        isFooterAtBottom
        onRenderFooterContent={() => {
          return (
            <>
              <PrimaryButton
                disabled={proxy.state?.inProgress}
                text={"Save"}
                onClick={outerSave}
              />
              <DefaultButton
                disabled={proxy.state?.inProgress}
                text={"Discard changes"}
                onClick={proxy.state?.discard}
              />
            </>
          );
        }}
      >
        <Form proxy={proxy} />
      </Panel>
    </>
  );
};
