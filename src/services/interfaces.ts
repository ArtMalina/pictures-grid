import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { ITileState, IUnmintedTileState } from "../interfaces/cells";
import { ReactNode } from "react";
import { Subject } from "rxjs";

export type AccountAddr = string & { _TYPE_: "AccountAddr" };
export type ContractTokenID = number & { _TYPE_: "ContractTokenID" };
export type ContractTileID = number & { _TYPE_: "ContractTileID" };

export const EMPTY_ADDR = "<no-account>" as AccountAddr;

export interface INotifyMessage {
    type: 'warning' | 'error' | 'info' | 'success';
    title?: string;
    text: ReactNode;
    width?: number;
    height?: number;
}

export interface INotifyContext {
    bus$: Subject<INotifyMessage>;
}


export type FormTileData = {
    title: string;
    price: string;
    url: string;
    description: string;
};

export type ContractTileInfo = {
    _id: any;
    id: ContractTileID;
    owner: AccountAddr;
    tokenId: ContractTokenID;
    url: string;
    title: string;
    version: number;
    boundedTiles: ContractTileID[];
};

export type ContractTokenInfo = {
    _id: any;
    id: ContractTokenID;
    owner: AccountAddr;
    price: string;
    url?: string;
};

export type DataServiceState = {
    tileCells: ITileState[];
    lastUpdate: number;
}

export interface IDataService {
    connect(): Promise<boolean>;
    getState(): BehaviorSubject<DataServiceState>;
    getAccount(): AccountAddr | null;
    getTileInfo(id: ContractTileID): Promise<ContractTileInfo | undefined>;
    fetchTokenInfo(id: ContractTokenID): Promise<ContractTokenInfo>;
    fetchTiles(): Promise<ContractTileInfo[]>;
    groupTiles(tiles: ITileState[], tileData: Partial<FormTileData>): Promise<[boolean, string]>;
    buyTiles(tiles: ITileState[], tileData: Partial<FormTileData>): Promise<[boolean, string]>;
    mintTiles(tiles: IUnmintedTileState[], tileData: Partial<FormTileData>): Promise<[boolean, string]>;
}