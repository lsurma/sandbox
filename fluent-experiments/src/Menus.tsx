import { atom, RecoilRoot, useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { DefaultButton, Dialog, DialogFooter, DialogType, Panel, PanelType, PrimaryButton } from "@fluentui/react";
import { useEffect, useId, useState } from "react";

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

  const action = () => {
    deleteConfirm.confirm(async () => {
      await new Promise((resolve, reject) => {
        setTimeout(resolve, 5000);
      })
      console.log("done");
    })
  };

console.log("menus page render");

  return <>
    <button onClick={() => setValue(value + 1)}>+ {value}</button>

    <button onClick={() => mainMenu.toggle()}>main</button>

    <button onClick={action}>confirm action</button>

  </>
}

export const Menus = () => {
  return <RecoilRoot>
    <MenusPage />
    <MenuRoot />
    <DialogsRoot />
  </RecoilRoot>
}