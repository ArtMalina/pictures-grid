import { appConfig } from '../AppConfig';
import { TileCoords } from '../interfaces/cells';

/**
 * 
 * @param cellNumber starts from ZERO
 * @returns 
 */
export function getPointByCellNumber(cellNumber: number): [number, number] {
    const y = Math.floor(cellNumber / appConfig.inRowCells);
    const x = cellNumber - appConfig.inRowCells * y;
    return [x, y];
}

export function getCellByClick(coordX: number, coordY: number, { inRowCount, cellW, cellH }: { inRowCount: number, cellW: number, cellH: number }) {
    const deltaX = Math.floor(coordX / cellW);
    const deltaY = Math.floor(coordY / cellH);
    return { cellNumber: deltaY * inRowCount + deltaX, x: deltaX, y: deltaY, w: cellW, h: cellH };
}

const getMin = (index: 0 | 1, arr: TileCoords[]) => arr.reduce<TileCoords>((memo, t) => (!memo[0] && !memo[1]) || memo[index] > t[index] ? [t[0], t[1]] : memo, [0, 0]);
const getMax = (index: 0 | 1, arr: TileCoords[]) => arr.reduce<TileCoords>((memo, t) => (!memo[0] && !memo[1]) || memo[index] < t[index] ? [t[0], t[1]] : memo, [0, 0]);

export const getBoundTilesCorners = (arr: TileCoords[]) => {

    const left = getMin(0, arr);
    const top = getMin(1, arr);

    const right = getMax(0, arr);
    const bottom = getMax(1, arr);

    return { left, top, right, bottom };

}