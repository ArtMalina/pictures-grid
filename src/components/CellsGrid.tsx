import { useEffect } from 'react';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { getBoundTilesCorners, getPointByCellNumber } from '../helpers/canvasMath';
import { IEventProps } from '../helpers/IEventProps';
import { ICellData, ITileState, MyCanvasMouseEvents, TileCoords } from '../interfaces/cells';


export interface ICellsGridEvent extends ICellData {
    mouseType: MyCanvasMouseEvents;
}

export interface ICellsGridProps extends IEventProps<[ICellsGridEvent[], ICellsGridEvent[], ITileState[], ITileState[]]> {
    cellW: number;
    cellH: number;
    cellBorderWidth: number;
    canvasSize: [number, number];
    amount: number;
    canvas2dCtxInList$: BehaviorSubject<CanvasRenderingContext2D[]>;
}

const COLORS = ['#212529', '#23272c', '#22262b', '#23282e', '#25292e'];

// const BORDER_COLOR = '#000000';
// // const BORDER_COLOR = '#accaef';
// const BORDER_HOVER_COLOR = 'yellow';
// const BORDER_SELECTED_COLOR = 'orange';

enum BorderColors {
    BASE = '#000000',
    HOVERED = 'yellow',
    SELECTED = 'orange',
    HOVER_SELECTED = '#69f0ae'
    // HOVER_SELECTED = '#00e5ff'
    // HOVER_SELECTED = '#e64a19'
    // HOVER_SELECTED = '#76ff03'

}

const getPointByArea = (tiledWidth: number, tiledHeight: number, offx = 0, offy = 0, offw = 0, offh = 0) =>
    (t: [number, number, number, number]) => [t[0] * tiledWidth + offx, t[1] * tiledHeight + offy, t[2] * tiledWidth - offw, t[3] * tiledHeight - offh];


const drawCell = (ctx2d: CanvasRenderingContext2D, [x, y, w, h]: [number, number, number, number], cellBorderWidth: number, cellData: ICellData) => {

    ctx2d.beginPath();

    // const r = 'rgb(38, 70, 83)'
    // const r = 40 - Math.round(4 * Math.random());
    // const g = 74 - Math.round(7 * Math.random());
    // const b = 87 - Math.round(8 * Math.random());
    // const r = 'rgb(61, 64, 91)'
    // const r = 64 - Math.round(6 * Math.random());
    // const g = 67 - Math.round(7 * Math.random());
    // const b = 95 - Math.round(9 * Math.random());
    // const r = 'rgb(0, 48, 73)'
    // const r = 0;
    // const g = 51 - Math.round(5 * Math.random());
    // const b = 77 - Math.round(7 * Math.random());

    ctx2d.fillStyle = COLORS[Math.floor(5 * Math.random())];
    ctx2d.rect(x, y, w + cellBorderWidth, h + cellBorderWidth);
    ctx2d.fill();

    ctx2d.lineWidth = cellBorderWidth;
    ctx2d.strokeStyle = BorderColors.BASE;
    ctx2d.stroke();

    ctx2d.font = "italic 12pt Arial";
    ctx2d.fillStyle = '#4fc3f7';
    ctx2d.fillText(`${cellData.cellNumber.toString()}`, Math.round(x + w * 0.1), Math.round(y + h * 0.5 - 5));
};

const drawCellsGrid = (
    ctx2d: CanvasRenderingContext2D,
    canvasSize: [number, number],
    cellsAmount: number,
    cellWidth: number,
    cellHeight: number,
    cellBorderWidth: number
) => {

    const [width] = canvasSize;

    let dy: number = cellBorderWidth * 0.5;
    let dx: number = cellBorderWidth * 0.5;

    Array.from(new Array(cellsAmount)).forEach((_empty: any, i: number) => {

        let offsetX = cellBorderWidth;
        let offsetY = cellBorderWidth;

        if (dx + cellWidth > width) {

            dx = cellBorderWidth * 0.5;
            dy += cellHeight + offsetY;
        }

        ((i, ddx, ddy) => drawCell(
            ctx2d,
            [ddx, ddy, cellWidth, cellHeight],
            cellBorderWidth,
            { cellNumber: i + 1, point: [-1, -1] }
        ))(i, dx, dy);

        dx += cellWidth + offsetX;
    });
};

// TODO: use via hoc maybe
const drawCellHovering = (
    ctx2d: CanvasRenderingContext2D,
    { point: [pointX, pointY] }: ICellData,
    _canvasSize: [number, number],
    [w, h]: [number, number],
    borderWidth: number,
    borderColor: BorderColors
) => {

    const px = borderWidth * 0.5 + (w + borderWidth) * pointX;
    const py = borderWidth * 0.5 + (h + borderWidth) * pointY;

    ctx2d.beginPath();

    ctx2d.rect(px, py, w + borderWidth, h + borderWidth);

    ctx2d.lineWidth = borderWidth;
    ctx2d.strokeStyle = borderColor;
    ctx2d.stroke();
};

const drawTileCell = (ctx2d: CanvasRenderingContext2D, tileCell: ITileState, _canvasSize: [number, number], [w, h]: [number, number], borderWidth: number) => {
    const [pointX, pointY] = tileCell.point;

    const x = borderWidth + (w + borderWidth) * pointX;
    const y = borderWidth + (h + borderWidth) * pointY;

    ctx2d.beginPath();

    ctx2d.fillStyle = '#37474f';
    ctx2d.rect(x, y, w, h);
    ctx2d.fill();

    if (!tileCell.tile.url) return;

    const img = new Image();
    img.onload = () => {


        if (tileCell.tile.boundedTiles.length && tileCell.tile.boundedTiles[0] === tileCell.tile.id) {
            console.warn('draw image', img, tileCell.tile);
            drawBoundedTilesImage(ctx2d, img, tileCell.tile.boundedTiles.map(t => getPointByCellNumber(t)), [w, h], borderWidth);
            return;
        }

        // const natW = img.naturalWidth;
        // const natH = img.naturalHeight;
        // ctx.drawImage(img, 0, 0, natW, natH, x, y, w, h);
        ctx2d.beginPath();
        ctx2d.rect(x, y, w, h);
        ctx2d.fillStyle = 'white';
        ctx2d.fill();
        ctx2d.drawImage(img, x, y, w, h);
    };
    img.src = tileCell.tile.url;

};

const drawBoundedTilesImage = (
    ctx2d: CanvasRenderingContext2D,
    image: HTMLImageElement,
    boundedCellsCoords: TileCoords[],
    [w, h]: [number, number],
    borderWidth: number
) => {

    const { left, right, bottom, top } = getBoundTilesCorners(boundedCellsCoords);

    console.warn('corners: left', left);
    console.warn('corners: right', right);
    console.warn('corners: top', top);
    console.warn('corners: bottom', bottom);

    const [dx, dy] = [right[0] - left[0] + 1, bottom[1] - top[1] + 1];

    console.log('dx dy in bounded ', dx, dy, borderWidth);

    const getCropPoint = getPointByArea(
        image.width / dx,
        image.height / dy,
        -left[0] * image.width / dx,
        -top[1] * image.height / dy,
        1 / dx,
        1 / dy
    );
    const getRealPoint = getPointByArea(w, h, 1, 1, 0, 0);

    boundedCellsCoords.forEach(t => {
        console.log('t', t);
        const [cropX, cropY, cropW, cropH] = getCropPoint([t[0], t[1], 1, 1]);
        const [realX, realY, realW, realH] = getRealPoint([t[0], t[1], 1, 1]);
        console.log('%c crop x-y-w-h ', 'background-color: brown;color: white', cropX, cropY, cropW, cropH);
        console.log('%c real x-y-w-h ', 'background-color: brown;color: white', realX, realY, realW, realH);
        const ofstX = borderWidth * 0.5 + borderWidth * t[0];
        const ofstY = borderWidth * 0.5 + borderWidth * t[1];
        ctx2d.drawImage(
            image,
            cropX, cropY,
            cropW, cropH,
            realX + ofstX, realY + ofstY,
            realW, realH
        );
    });

};

const CellsGrid = (props: ICellsGridProps) => {

    const { cellW, cellH, cellBorderWidth, amount, canvas2dCtxInList$, event$, canvasSize } = props;

    useEffect(() => {
        console.log('%c render cells Grid! ', 'border: 1px solid orange;', canvasSize);
        const sub = canvas2dCtxInList$.subscribe((ctx2dInList) => {
            ctx2dInList.forEach(ctx2d => {
                drawCellsGrid(ctx2d, canvasSize, amount, cellW, cellH, cellBorderWidth);
            });
        });
        return () => sub.unsubscribe();
    }, [cellW, cellH, cellBorderWidth, amount, canvasSize, canvas2dCtxInList$]);

    useEffect(() => {
        const sub = event$.subscribe(([displaying, clearing, tilesForDisplay, tilesForClear]) => {
            // console.log('cellsEvData: displaying', displaying);
            // console.log('cellsEvData: clearing', clearing);
            canvas2dCtxInList$.getValue().forEach(ctx2d => {

                let clearedCellNumberMap: any = {};
                let displayedMap: any = {};
                const displayHoverSelectedCells: ICellsGridEvent[] = [];

                tilesForDisplay.forEach(tileCell => {
                    console.log('%c tileCell ', 'background-color: grey; color: blue;', tileCell);
                    drawTileCell(ctx2d, tileCell, canvasSize, [cellW, cellH], cellBorderWidth);
                });

                clearing.forEach(({ cellNumber, point }) => {
                    const isDisplayedOneLst = displaying.filter((t) => t.mouseType === MyCanvasMouseEvents.Click && t.cellNumber === cellNumber);
                    // clear previous position!
                    clearedCellNumberMap[cellNumber] = 1;
                    if (!isDisplayedOneLst.length) {
                        drawCellHovering(ctx2d, { cellNumber, point }, canvasSize, [cellW, cellH], cellBorderWidth, BorderColors.BASE);
                    }
                });
                displaying.forEach((t) => {
                    const { cellNumber, mouseType, point } = t;
                    // and then draw new hover position
                    let color = mouseType === MyCanvasMouseEvents.Click ? BorderColors.SELECTED : BorderColors.HOVERED;
                    if (displayedMap[cellNumber]) {
                        // color = BorderColors.HOVER_SELECTED;
                        displayHoverSelectedCells.push(t);
                    } else {
                        drawCellHovering(ctx2d, { cellNumber, point }, canvasSize, [cellW, cellH], cellBorderWidth, color);
                    }
                    if (mouseType === MyCanvasMouseEvents.Click) displayedMap[cellNumber] = 2;
                    if (mouseType === MyCanvasMouseEvents.Move) displayedMap[cellNumber] = 1;
                });
                displayHoverSelectedCells.forEach(({ cellNumber, point }) => {
                    drawCellHovering(ctx2d, { cellNumber, point }, canvasSize, [cellW, cellH], cellBorderWidth, BorderColors.HOVER_SELECTED);
                });
            });
        });
        return () => sub.unsubscribe();
    }, [event$, canvas2dCtxInList$, cellW, cellH, cellBorderWidth, canvasSize]);

    return null;
};

export default CellsGrid;