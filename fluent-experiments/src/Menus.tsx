import { atom, RecoilRoot, useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { Panel, PanelType } from "@fluentui/react";
import { useEffect, useId, useState } from "react";

interface Menu {
  id : string;
  isOpen : boolean;
  content ?: (() => any) | JSX.Element | React.ReactNode;
}

const menus = atom<Record<string, Menu>>({
  key : "xxx",
  default : {}
})

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

console.log("menus page render");

  return <>
    <button onClick={() => setValue(value + 1)}>+ {value}</button>

    <button onClick={() => mainMenu.toggle()}>main</button>

  </>
}

export const Menus = () => {
  return <RecoilRoot>
    <MenusPage />
    <MenuRoot />
  </RecoilRoot>
}