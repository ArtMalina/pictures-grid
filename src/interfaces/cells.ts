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
    None = 0,
    Open = 1,
    Close = 2,
    Save = 3,
    RemoveItems = 4,
    Modify = 5,
    ShowOwn = 6,
    ShowOther = 7,
    SaveTiles = 8
}

type CartEventsOfCell = CartEvents.Close
    | CartEvents.None
    | CartEvents.Open
    | CartEvents.RemoveItems
    | CartEvents.Save
    | CartEvents.ShowOther
    | CartEvents.ShowOwn;

type CellsEventCart = {
    payload: ICellEventData[];
    type: CartEventsOfCell;
    status?: any;
};

type TilesEvenCart = {
    payload: ITileState[];
    type: CartEvents.Modify | CartEvents.SaveTiles;
    status?: any;
    groupUrl: string;
};

export type ICartEventData = CellsEventCart | TilesEvenCart;

export interface ITileState extends ICellData {
    tile: ContractTileInfo;
    token: ContractTokenInfo;
}