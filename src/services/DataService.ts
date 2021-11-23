import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { ITileState, IUnmintedTileState } from "../interfaces/cells";
import {
    AccountAddr,
    ContractTileID,
    ContractTileInfo,
    ContractTokenID,
    ContractTokenInfo,
    DataServiceState,
    FormTileData,
    IDataService
} from "./interfaces";

export default class DataService implements IDataService {
    buyTiles(tiles: ITileState[], tileData: Partial<FormTileData>): Promise<[boolean, string]> {
        throw new Error("Method not implemented.");
    }
    mintTiles(tiles: IUnmintedTileState[], tileData: Partial<FormTileData>): Promise<[boolean, string]> {
        throw new Error("Method not implemented.");
    }
    groupTiles(tiles: ITileState[], tileData: Partial<FormTileData>): Promise<[boolean, string]> {
        throw new Error("Method not implemented.");
    }
    getState(): BehaviorSubject<DataServiceState> {
        throw new Error("Method not implemented.");
    }
    connect(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    getAccount(): AccountAddr | null {
        throw new Error("Method not implemented.");
    }
    getTileInfo(id: ContractTileID): Promise<ContractTileInfo> {
        throw new Error("Method not implemented.");
    }
    fetchTokenInfo(id: ContractTokenID): Promise<ContractTokenInfo> {
        throw new Error("Method not implemented.");
    }
    fetchTiles(): Promise<ContractTileInfo[]> {
        throw new Error("Method not implemented.");
    }
}