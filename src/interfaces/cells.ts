import { ContractTileInfo, ContractTokenInfo } from "../services/interfaces";

export type TileCoords = [number, number];

export enum MyCanvasMouseEvents {
    None = -1,
    Move = 0,
    Click = 1
}

export enum MyModes {
    None = '<none>',
    Buy = '<buy-cell>',
    Edit = '<edit-cell>',
}

export interface ICellData {
    cellNumber: number;
    point: TileCoords;
}

export type ICellEventData = {
    lastCell: ICellData;
    curr: ICellData;
    mouseType: MyCanvasMouseEvents;
    // contractTile?: ContractTileInfo;
    // lastUpdate?: number;
};

export enum CartEvents {
    None = 'None',
    Open = 'Open',
    Close = 'Close',
    Save = 'Save',
    Buy = 'Buy',
    RemoveItems = 'RemoveItems',
    Modify = 'Modify',
    ShowOwn = 'ShowOwn',
    ShowOther = 'ShowOther',
    SaveTiles = 'SaveTiles',
}

type CartEventsOfCell =
    | CartEvents.Close
    | CartEvents.None
    | CartEvents.Open
    | CartEvents.ShowOther
    | CartEvents.ShowOwn;

type CellsEventCart = {
    payload: ICellEventData[];
    type: CartEventsOfCell;
    status?: any;
};

type TileData = {
    tile: ContractTileInfo;
    token: ContractTokenInfo;
}

export type ITileState = ICellData & TileData;

export type IUnmintedTileState = ICellData & Partial<TileData>;

export type TilesEventCart = {
    payload: IUnmintedTileState[];
    params?: Partial<ContractTileInfo>;
    type:
    | CartEvents.Close
    | CartEvents.None
    | CartEvents.Save
    | CartEvents.Open
    | CartEvents.Modify
    | CartEvents.SaveTiles
    | CartEvents.Buy
    | CartEvents.RemoveItems;
    status?: any;
    groupUrl: string;
};

export type ICartEventData = CellsEventCart | TilesEventCart;
