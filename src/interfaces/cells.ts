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
}

export interface ICartEventData {
    payload: ICellEventData[];
    type: CartEvents;
}

export interface ITileState extends ICellData {
    tile: ContractTileInfo;
    token: ContractTokenInfo;
}