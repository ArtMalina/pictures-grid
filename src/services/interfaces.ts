import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { ITileState } from "../interfaces/cells";

export type AccountAddr = string & { _TYPE_: "AccountAddr" };
export type ContractTokenID = number & { _TYPE_: "ContractTokenID" };
export type ContractTileID = number & { _TYPE_: "ContractTileID" };

export const EMPTY_ADDR = "<no-account>" as AccountAddr;

export type ContractTileInfo = {
    id: ContractTileID;
    owner: AccountAddr;
    tokenId: ContractTokenID;
    url: string;
    title: string;
    boundedTiles: ContractTileID[];
};

export type ContractTokenInfo = {
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
    groupTiles(tiles: ITileState[], groupUrl: string): Promise<[boolean, string]>;
}