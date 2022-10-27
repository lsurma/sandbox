import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  DetailsList,
  IColumn,
  SelectionMode,
  Selection,
  IDetailsListProps,
} from "@fluentui/react";
import { FluentSelection } from "./CustomSelection";

const getKey = (item: any) => {
  return item.id.toString();
};

class CustomSelection<TItem> extends Selection<TItem> {
  public store: TItem[] = [];
  public storeRef: any;

  public visibleStore: TItem[] = [];
  public activeList: boolean = false;
  public onSetIndexSelected?: (
    index: number,
    isSelected: boolean,
    vItem: any,
    sItem: any
  ) => boolean;
  //
  // setAllSelected(isAllSelected: boolean) {
  //   this.setRangeSelected(0, this.visibleStore.length, isAllSelected, false);
  // }
  //
  // setIndexSelected(index: number, isSelected: boolean, shouldAnchor: boolean) {
  //   const visibleItem: any = this.visibleStore?.[index];
  //
  //   if (!visibleItem) {
  //     return false;
  //   }
  //
  //   const storeItemIndex: any = this.store.findIndex(
  //     (i) => i.id == visibleItem.id
  //   );
  //   const storeItem: any = this.store.find((i) => i.id == visibleItem.id);
  //
  //   let before = undefined;
  //   if (this.onSetIndexSelected) {
  //     before = this.onSetIndexSelected(
  //       index,
  //       isSelected,
  //       visibleItem,
  //       storeItem
  //     );
  //
  //     return;
  //   }
  //
  //   storeItem.selected = isSelected;
  //   super.setIndexSelected(storeItemIndex, isSelected, shouldAnchor);
  // }
  //
  // isIndexSelected(index: number): boolean {
  //   if (this.activeList) {
  //     return true;
  //   }
  //
  //   const visibleItem: any = this.visibleStore?.[index];
  //   if (!visibleItem) {
  //     return false;
  //   }
  //
  //   const storeItem: any = this.store.find((i) => i.id == visibleItem.id);
  //
  //   return storeItem.selected;
  // }

  setItems(items: TItem[], shouldClear?: boolean, original?: boolean) {
    if (this.storeRef?.current) {
      super.setItems(
        this.storeRef?.current,
        shouldClear && original ? shouldClear : false
      );
    } else {
      super.setItems(this.store ?? [], shouldClear);
    }
  }
}

const List = (props: IDetailsListProps) => {
  return (
    <DetailsList
      {...props}
      selectionMode={SelectionMode.multiple}
      getKey={getKey}
      selectionPreservedOnEmptyClick
    />
  );
};

export const SyncedList = () => {
  const itemsRef = useRef<any>([]);
  const [items, setItems] = useState<any>([]);
  const [items2, setItems2] = useState<any>([]);
  const [fListKey, setFListKey] = useState<any>("");

  const [selectedItemKeys, setSelectedItemKeys] = useState<any>([]);
  const [search, setSearch] = useState<any>([]);

  const visibleItems = items.filter(
    (item: any) =>
      !search || search == "" || JSON.stringify(item).includes(search)
  );
  const visibleSelectedItems = visibleItems.filter((i: any) =>
    selectedItemKeys.includes(i.id)
  );
  const genItems = () => {
    const i = [
      {
        id: "1",
        title: "1",
      },
      {
        id: "2",
        title: "aa",
      },

      {
        id: "3",
        title: "ab",
      },

      {
        id: "4",
        title: "4",
      },
    ];

    itemsRef.current = [...i];
    setItems([...i]);
    setItems2([...i]);
  };

  const columns = useMemo(
    (): IColumn[] => [
      {
        key: "title",
        minWidth: 100,
        name: "title",
        fieldName: "title",
      },
    ],
    []
  );

  useEffect(() => {
    genItems();
  }, []);

  const selectionHandler = useMemo(() => {
    const instance = new CustomSelection({
      getKey,
      items: [],
      onSelectionChanged: () => {
        console.log(selectionHandler.getSelection().map(getKey));
        setSelectedItemKeys(selectionHandler.getSelection().map(getKey));
      },
    });
    instance.storeRef = itemsRef;
    return instance;
  }, []);

  // selectionHandler.store = items;
  selectionHandler.visibleStore = [...visibleItems];

  const selectionHandlerR = useMemo(() => {
    const instance = new CustomSelection({
      getKey,
      items: [],
      onSelectionChanged: () => {},
    });
    // instance.activeList = true;
    instance.onSetIndexSelected = (index, isSelected, vItem, sItem) => {
      if (isSelected) {
        return false;
      }

      setSelectedItemKeys((c) => {
        console.log([...c.filter((k: string) => k != vItem.id)]);

        return [...c.filter((k: string) => k != vItem.id)];
      });

      return false;
    };
    return instance;
  }, []);

  selectionHandlerR.store = [...visibleSelectedItems];
  selectionHandlerR.visibleStore = [...visibleSelectedItems];

  useEffect(() => {
    console.log("eff");

    console.log(selectedItemKeys);

    visibleItems.forEach((i: any, index: number) => {
      console.log("visibleItems", i);

      if (selectedItemKeys.includes(i.id)) {
        selectionHandler.setIndexSelected(index, true, false);
      } else {
        selectionHandler.setIndexSelected(index, false, false);
      }
    });
  }, [JSON.stringify(visibleItems), JSON.stringify(selectedItemKeys)]);

  console.log("refresh");

  return (
    <>
      <button
        onClick={() => {
          setItems([
            ...items.map((i: any, index: number) => ({
              ...i,
              selected: selectedItemKeys.includes(i.id),
            })),
          ]);
        }}
      >
        set items
      </button>

      <input type="search" onChange={(e) => setSearch(e.target.value)} />

      <div style={{ display: "flex" }}>
        <div style={{ width: "49%" }}>
          <List
            items={visibleItems}
            columns={columns}
            selection={selectionHandler}
          />
        </div>
        <div style={{ width: "49%" }}>
          b
          <List items={visibleSelectedItems} columns={columns} />
        </div>
      </div>
    </>
  );
};
