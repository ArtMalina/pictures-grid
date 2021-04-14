import { getPointByCellNumber } from "../helpers/canvasMath";
import { ITileState } from "../interfaces/cells";
import { ContractTileInfo, ContractTokenInfo } from "./interfaces";

export const fromContractTile = (tile: ContractTileInfo, token: ContractTokenInfo): ITileState => {
    return {
        tile,
        token,
        cellNumber: tile.id,
        point: getPointByCellNumber(tile.id)
    }
};