import { useState } from 'react';
import './App.css';
import { DetailsList, SelectionMode, Selection, registerIcons, initializeIcons } from "@fluentui/react";
import { Menus } from "./Menus";
import { FormTest } from "./FormController";
import { SyncedList } from "./SyncedList";

const genItems = () => {
  return Array(10000).fill(1).map((v, i) => ({ key : i, id : i, title : i}))

}

initializeIcons();

function App() {
  return <SyncedList />
  return <FormTest />

  return <Menus />

  const [items, setItems] = useState(() => genItems());

  const selectionHandler = new Selection({
    onSelectionChanged : () => {
      console.log( selectionHandler.getSelection())
    }
  });



  return (
    <div className="App">
      <div className={"header"}>
        <div className={"headerN"}>page container (title)</div>
        <div className={"header"}>page container (title)</div>

      </div>

      <div className={"page"}>
        <div className={"list"}>
          <div className={"listToolbar"}>toolbar
          </div>
          <div className={"listList"}>
            <DetailsList items={items} columns={[{ key : "title", minWidth : 100, name : "title", fieldName : "title" }]}
            selection={selectionHandler}
             selectionMode={SelectionMode.multiple}
            listProps={{
              onRenderRoot : (props, defaultRender) => {
console.log(props);
                (props as any).divProps["data-is-scrollable"] = true;
                (props as any).divProps.style = { overflow : "auto" , height :500};


                return defaultRender ? defaultRender(props) : <></>
              }
            }}
            />
          </div>
        </div>
      </div>

    </div>
  )
}

export default App
