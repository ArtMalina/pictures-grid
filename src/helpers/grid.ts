import { ICellsGridEvent } from "@components/CellsGrid";
import { ICellEventData } from "../interfaces/cells";

export const MAP_CURR_CELL_EV_TO_CELL_GRID_EV = (t: ICellEventData, _i: number, _arr: ICellEventData[]): ICellsGridEvent => ({
    cellNumber: t.curr.cellNumber,
    point: t.curr.point,
    mouseType: t.mouseType,
});