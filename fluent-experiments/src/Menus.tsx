import { atom, RecoilRoot, useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { DefaultButton, Dialog, DialogFooter, DialogType, Panel, PanelType, PrimaryButton } from "@fluentui/react";
import { useEffect, useId, useRef, useState } from "react";

interface Menu {
  id : string;
  isOpen : boolean;
  content ?: (() => any) | JSX.Element | React.ReactNode;
}

interface ConfirmationDialog
{
  id : string;
  isOpen : boolean;
  inProgress ?: boolean;
  content ?: (() => any) | JSX.Element | React.ReactNode;
  onConfirmed ?: (() => any)

}

const dialogs = atom<Record<string, ConfirmationDialog>>({
  key : "ConfirmationDialogs",
  default : {}
})

const menus = atom<Record<string, Menu>>({
  key : "xxx",
  default : {}
})


export const DialogsRoot = () => {
  const [items, setItems] = useRecoilState(dialogs);

  const dismiss = (id : string) => {
    setItems((items) => {
      const item = {...items[id]};
      item.isOpen = false;
      return {
        ...items,
        [id] : item
      }
    })
  }

  const onConfirm = async (id : string) => {
    try {
      const item = items[id];

      setItems((items) => {
        const item = {...items[id]};
        item.inProgress = true;

        return {
          ...items,
          [id] : item
        }
      })

      // Run callback
      if(typeof  item.onConfirmed === "function") {
        await item.onConfirmed();
      }

    } catch (e) {
      console.error(e);
    } finally {
      setItems((items) => {
        const item = {...items[id]};
        item.inProgress = false;
        item.isOpen = false;

        return {
          ...items,
          [id] : item
        }
      })

    }
  }

  return <>
    {Object.keys(items).map((id) => {
      const item = items[id];

      return   <Dialog
          key={item.id}
          hidden={!item.isOpen}
          modalProps={{
            isBlocking : true
          }}
          dialogContentProps={{
            type: DialogType.normal,
            title: 'Missing Subject',
            subText: 'Do you want to send this message without a subject?',
          }}
          onDismiss={() => dismiss(id)}
      >
        <DialogFooter>
          <DefaultButton disabled={item.inProgress} onClick={() => dismiss(id)} text="Don't send" />
          <PrimaryButton disabled={item.inProgress} onClick={() => onConfirm(id)} text="Send" />
        </DialogFooter>
      </Dialog>

    })}
  </>
}

export const MenuRoot = () => {
  const [items, setItems] = useRecoilState(menus);

  const dismiss = (id : string) => {
    setItems((items) => {
      const item = {...items[id]};
      item.isOpen = false;
      return {
        ...items,
        [id] : item
      }

    })
  }

  return <>
    {Object.keys(items).map((id) => {
      const item = items[id];

      return <Panel onDismiss={() => dismiss(id)} isBlocking={false} key={item.id} isOpen={item.isOpen} type={PanelType.medium}>
        {typeof item.content === "function" ? item.content() : item.content}
      </Panel>
    })}
  </>
}

interface UseMenuProps
{
  content ?: (() => any) | JSX.Element | React.ReactNode;
}

const useConfirmation = () => {
  const setItems = useSetRecoilState(dialogs);
  const id = useId();


  useEffect(() => {
    // Register menu
    setItems((items) => {

      return {
        ...items,
        [id] : {
          id : id,
          isOpen : false,
        }
      }
    })
  }, [])

  return {
    confirm : (onConfirmed ?: any) => {
      setItems((items) => {
        const item = {...items[id]};
        item.isOpen = !item.isOpen ;

        item.onConfirmed = onConfirmed;

        return {
          ...items,
          [id] : item
        }
      })
    }
  }
}

const useMenu = (props : UseMenuProps) => {
  const setItems = useSetRecoilState(menus);
  const id = useId();

  useEffect(() => {
    // Register menu
    setItems((items) => {

      return {
        ...items,
        [id] : {
          id : id,
          isOpen : false,
          content : props?.content
        }
      }
    })
  }, [])

  return {
    toggle : (content ?: any) => {
      setItems((items) => {
        const item = {...items[id]};
        item.isOpen = !item.isOpen ;

        if(content) {
          item.content = content;
        }

        return {
          ...items,
          [id] : item
        }
      })
    }
  }
}

const useAction = () => {
  const [inProgress, setInProgress] = useState(false);

  return {
    inProgress,

    invoke : async (callback : () => any) => {
      try {
        if(inProgress) {
          return;
        }

        setInProgress(true);

        await callback();
      } catch (e) {
        alert(e!.toString());
      } finally {
        setInProgress(false);
      }

    }
  }
}

interface FormController
{
  inProgress : boolean;
  setData : (data : any) => void
  submit : () => void
}

const useFormController = () : FormController => {
  let storeRef = useRef({});
  const [inProgress, setInProgress] = useState(false);

  return {
    inProgress,

    setData : (data : any) => {
      storeRef.current = data;
    },

    submit : async () => {
      console.log("start");
      setInProgress(true);
      await new Promise((resolve) => {
        console.log(storeRef.current);

        setTimeout(resolve, 5000);
      })
      setInProgress(false);
      console.log("end");
    }
  }
}


const Form = (props : { controller ?: FormController}) => {
  const [value, setValue] = useState("");

  const submit = () => {
    if(props.controller) {
      props.controller.submit();
    }
  }


  return (<div style={{ marginTop : 20 }}>
    form with actions ({value})<br />
    <input value={value} onChange={(e) => {
      setValue(e.currentTarget.value)
      props.controller?.setData({
        value : e.currentTarget.value
      })
    }}/>
    <br />
    <button disabled={props.controller?.inProgress} onClick={submit}>submit form form</button>

  </div>)
}


const MenusPage = () => {
  const [value, setValue] = useState<number>(0);
  const otherMenu = useMenu({
    content : <>other menu</>
  });

  const mainMenu = useMenu({
    content : <>
      <button onClick={() => otherMenu.toggle()}>otherMenu</button>
    </>
  });

  const deleteConfirm = useConfirmation();
  const actionHandler = useAction();

  const action = () => {
     actionHandler.invoke(async () => {
      console.log("start");
      await new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error("err")), 5000);
      })
      console.log("done");
    });

    // deleteConfirm.confirm(async () => {
    //   await actionHandler.invoke(async () => {
    //     console.log("start");
    //     await new Promise((resolve, reject) => {
    //       setTimeout(() => reject(new Error("err")), 5000);
    //     })
    //     console.log("done");
    //   });
    // })


  };

console.log("menus page render");

  const formController = useFormController();

  return <>
    <button onClick={() => setValue(value + 1)}>+ {value}</button>

    <button onClick={() => mainMenu.toggle()}>main</button>

    <button onClick={action}>confirm action</button>

    <Form controller={formController} />
    <button disabled={formController.inProgress} onClick={formController.submit}>submit from outside</button>

  </>
}

export const Menus = () => {
  return <RecoilRoot>
    <MenusPage />
    <MenuRoot />
    <DialogsRoot />
  </RecoilRoot>
}