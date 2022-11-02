import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  DetailsList,
  EventGroup,
  IColumn,
  IDetailsListProps,
  Selection,
  SelectionMode,
} from "@fluentui/react";
import { FluentSelection } from "./CustomSelection";
import { ISelection } from "@fluentui/react/dist/react";
import { SELECTION_CHANGE } from "@fluentui/utilities";

const getKey = (item: any) => {
  return item.id.toString();
};

interface TItemWithId {
  id: string;
}

class PersSel<TItem = TItemWithId> implements ISelection<TItem> {
  public count: number;
  public mode: SelectionMode;

  private items: TItem[] = [];
  private visibleItems: TItem[] = [];
  private selectedItemKeys: string[] = [];
  private onSelectionChanged = (selectedKeys: string[]) => {};

  constructor(options?: any) {
    this.count = 0;
    this.mode = SelectionMode.multiple;
    this.onSelectionChanged = options.onSelectionChanged;
  }

  canSelectItem(item: TItem, index: number | undefined): boolean {
    return true;
  }

  public setData(
    items: TItem[],
    visibleItems: TItem[],
    selectedItemKeys: string[]
  ) {
    this.items = items;
    this.visibleItems = visibleItems;
    this.selectedItemKeys = selectedItemKeys;

    // Rebuild cache

    // Emit update event
    console.log("aa");
    EventGroup.raise(this, "items-change");
    EventGroup.raise(this, "change");
  }

  getItemIndex(key: string): number {
    return 0;
  }

  getItems(): TItem[] {
    return this.visibleItems;
  }

  getSelectedCount(): number {
    return this.selectedItemKeys.length;
  }

  getSelectedIndices(): number[] {
    return [];
  }

  getSelection(): TItem[] {
    return [];
  }

  isAllSelected(): boolean {
    console.log("isAllSelected");

    return (
      this.selectedItemKeys.length > 0 &&
      this.visibleItems.every((vi) => this.selectedItemKeys.includes(vi.id))
    );
  }

  isIndexSelected(index: number): boolean {
    const item = this.visibleItems?.[index];
    console.log("isIndexSelected");
    console.log(item);
    console.log(index);

    if (!item) {
      return false;
    }

    // @ts-ignore
    return this.selectedItemKeys.includes(item.id);
  }

  isKeySelected(key: string): boolean {
    return false;
  }

  isModal(): boolean {
    return true;
  }

  isRangeSelected(fromIndex: number, count: number): boolean {
    return false;
  }

  selectToIndex(index: number, clearSelection?: boolean): void {
    console.log("selectToIndex");
  }

  selectToKey(key: string, clearSelection?: boolean): void {
    console.log("selectToKey");
  }

  selectToRange(index: number, count: number, clearSelection?: boolean): void {
    console.log("selectToRange");
  }

  setAllSelected(isAllSelected: boolean): void {
    console.log("setAllSelected");
  }

  setChangeEvents(isEnabled: boolean, suppressChange?: boolean): void {}

  setIndexSelected(
    index: number,
    isSelected: boolean,
    shouldAnchor: boolean,
    emitEvent: boolean = false
  ): void {
    const item = this.visibleItems[index];

    // @ts-ignore
    const newItems = isSelected
      ? [...this.selectedItemKeys, item.id]
      : this.selectedItemKeys.filter((key) => key != item.id);

    // @ts-ignore
    this.onSelectionChanged(newItems);
    // EventGroup.raise(this, "change");
  }

  setItems(items: TItem[], shouldClear: boolean): void {}

  setKeySelected(
    key: string,
    isSelected: boolean,
    shouldAnchor: boolean
  ): void {
    console.log("setKeySelected");
  }

  setModal(isModal: boolean): void {}

  setRangeSelected(
    fromIndex: number,
    count: number,
    isSelected: boolean,
    shouldAnchor: boolean
  ): void {
    console.log("setRangeSelected");
  }

  toggleAllSelected(): void {
    console.log("toggleAllSelected");
  }

  toggleIndexSelected(index: number): void {
    this.setIndexSelected(index, !this.isIndexSelected(index), false);
  }

  toggleKeySelected(key: string): void {
    console.log("toggleKeySelected");
  }

  toggleRangeSelected(fromIndex: number, count: number): void {
    console.log("toggleRangeSelected");
  }
}

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

  setAllSelected(isAllSelected: boolean) {
    this.setRangeSelected(0, this.visibleStore.length, isAllSelected, false);
  }

  setIndexSelected(index: number, isSelected: boolean, shouldAnchor: boolean) {
    const visibleItem: any = this.visibleStore?.[index];

    if (!visibleItem) {
      return false;
    }

    const storeItemIndex: any = this.store.findIndex(
      (i) => i.id == visibleItem.id
    );
    const storeItem: any = this.store.find((i) => i.id == visibleItem.id);

    let before = undefined;
    if (this.onSetIndexSelected) {
      before = this.onSetIndexSelected(
        index,
        isSelected,
        visibleItem,
        storeItem
      );

      return;
    }

    storeItem.selected = isSelected;
    super.setIndexSelected(storeItemIndex, isSelected, shouldAnchor);
  }

  isIndexSelected(index: number): boolean {
    if (this.activeList) {
      return true;
    }

    const visibleItem: any = this.visibleStore?.[index];
    if (!visibleItem) {
      return false;
    }

    const storeItem: any = this.store.find((i) => i.id == visibleItem.id);

    return storeItem.selected;
  }

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

class PersistentSelection<TItem> extends FluentSelection<TItem> {
  public store: TItem[] = [];
  public visibleStore: TItem[] = [];
  public itemsSet = false;

  getSelection(): TItem[] {
    return this.store.filter((i: any) => i.selected);
  }

  isAllSelected(): boolean {
    return (
      this.visibleStore.length > 0 &&
      this.visibleStore.every((i: any) => i.selected)
    );
  }

  setAllSelected(isAllSelected: boolean) {
    this.setRangeSelected(0, this.visibleStore.length, isAllSelected, false);
  }

  setIndexSelected(index: number, isSelected: boolean, shouldAnchor: boolean) {
    const visibleItem: any = this.visibleStore?.[index];
    if (!visibleItem) {
      return false;
    }
    const storeItem: any = this.store.find((i) => i.id == visibleItem.id);
    const storeItemIndex: any = this.store.findIndex(
      (i) => i.id == visibleItem.id
    );

    storeItem.selected = isSelected;
    // super.setIndexSelected(storeItemIndex, isSelected, shouldAnchor);
    this._change();
  }

  isIndexSelected(index: number): boolean {
    const visibleItem: any = this.visibleStore?.[index];
    if (!visibleItem) {
      return false;
    }

    const storeItem: any = this.store.find((i) => i.id == visibleItem.id);

    return storeItem.selected;
  }

  setItems(items: TItem[], shouldClear: boolean = true) {
    super.setItems(this.store ?? [], shouldClear);
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

  const isVisible = (item: any) =>
    !search ||
    search == "" ||
    JSON.stringify(item).toLowerCase().includes(search.toLowerCase());

  const visibleItems = items.filter((i: any) => isVisible(i));

  const visibleSelectedItems = visibleItems.filter((i: any) =>
    selectedItemKeys.includes(i.id)
  );
  const genItems = () => {
    let i = [
      {
        id: "1",
        title: "AA1 ",
      },
      {
        id: "2",
        title: "1",
      },

      {
        id: "3",
        title: "2",
      },

      {
        id: "4",
        title: "AA 4",
      },
    ];

    // @ts-ignore
    i = new Array(4000)
      .fill(0, 0, 4000)
      .map((v) => ({ id: Math.random(), title: Math.random() }));

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
    const instance = new PersSel({
      getKey,
      items: [],
      onSelectionChanged: (keys: string[]) => {
        console.log(keys);
        setSelectedItemKeys(keys);
        // console.log(selectionHandler.getSelection().map(getKey));
      },
    });
    return instance;
  }, []);

  useEffect(() => {
    // selectionHandler.emitChange();
  }, [visibleItems]);

  selectionHandler.setData(items, visibleItems, selectedItemKeys);

  // selectionHandler.store = items;
  // selectionHandler.visibleStore = visibleItems;

  //
  // useEffect(() => {
  //   console.log("eff");
  //
  //   console.log(selectedItemKeys);
  //
  //   visibleItems.forEach((i: any, index: number) => {
  //     console.log("visibleItems", i);
  //
  //     if (selectedItemKeys.includes(i.id)) {
  //       selectionHandler.setIndexSelected(index, true, false);
  //     } else {
  //       selectionHandler.setIndexSelected(index, false, false);
  //     }
  //   });
  // }, [JSON.stringify(visibleItems), JSON.stringify(selectedItemKeys)]);

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

      <button
        onClick={() => {
          setItems([...items.reverse()]);
        }}
      >
        reorder
      </button>

      <input type="search" onChange={(e) => setSearch(e.target.value)} />

      <div style={{ display: "flex" }}>
        <div style={{ width: "49%", height: 500, overflow: "scroll" }}>
          <List
            items={visibleItems}
            columns={columns}
            selection={selectionHandler}
            isSelectedOnFocus={false}
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
