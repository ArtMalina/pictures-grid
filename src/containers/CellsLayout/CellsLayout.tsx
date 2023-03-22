import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Subject } from 'rxjs/internal/Subject';

import ServiceContext from '../../contexts/ServiceContext';

import CanvasComponent from '../../components/Canvas';

import CellsGrid, { CellsGridEventData, ICellsGridEvent } from '../../components/CellsGrid';
import { getCellByClick } from '../../helpers/canvasMath';
import { IEventProps } from '../../helpers/IEventProps';
import { ICellData, ICellEventData, ITileState, MyCanvasMouseEvents, MyModes } from '../../interfaces/cells';
import { AccountAddr, EMPTY_ADDR, IDataService } from '../../services/interfaces';
import useServiceSubForCellsDisplay from './hooks/useServiceSubForCellsDisplay';
import useCellsUpdaterSubForGridEvents from './hooks/useCellsUpdaterSubForGridEvents';
import useMouseSubForGridEvents from './hooks/useMouseSubForGridEvents';

export enum CellEventTypes {
    None = 0,
    Add = 1,
    Remove = 2,
    UpdateByContract = 3,
    DisplayOwnCells = 4,
    DisplayOtherCells = 5,
    DisplayAll = 6,
    UserUpdateTileGroup = 7,
}

export type NoneEvent = [CellEventTypes.None, ICellEventData[]];
export type AddTileEvent = [CellEventTypes.Add, ICellEventData[]];
export type RemoveTileInModifyModeEvent = [CellEventTypes.Remove, ITileState[]];
export type UpdateByContractEvent = [CellEventTypes.UpdateByContract, ICellEventData[]];
export type DisplayCellsEvent = [CellEventTypes.DisplayOwnCells, ICellEventData[]];
export type DisplayOtherEvent = [CellEventTypes.DisplayOtherCells, ICellEventData[]];
export type DisplayAllEvent = [CellEventTypes.DisplayAll, ICellEventData[]];
export type UserTilesSaveEvent = [CellEventTypes.UserUpdateTileGroup, ITileState[]];

export type CellsEvent =
    | NoneEvent
    | AddTileEvent
    | RemoveTileInModifyModeEvent
    | UpdateByContractEvent
    | DisplayCellsEvent
    | DisplayOtherEvent
    | DisplayAllEvent
    | UserTilesSaveEvent;

export interface ICellsLayoutProps extends IEventProps<ICellEventData[]> {
    cellsUpdate$: Subject<CellsEvent>;
    currentAcc$: BehaviorSubject<AccountAddr>;
    cellsAmount: number;
    cellSize: [number, number];
    cellBorderWidth: number;
    maxCanvasWidth: number;
}

const Component = (props: ICellsLayoutProps) => {
    const { cellSize, cellsAmount, cellBorderWidth, maxCanvasWidth, event$, cellsUpdate$, currentAcc$ } = props;

    // TODO: MODE from props
    const modeRef = useRef<MyModes>(MyModes.Buy);

    const dataService = useContext(ServiceContext) as IDataService;

    const [cellWidth, cellHeight] = cellSize;

    const [sizeWithOuter, setSize] = useState<[number, number, boolean]>([0, 0, false]);
    const boxRef = useRef<HTMLDivElement | null>(null);
    const cellsLayoutSizeRef = useRef<[number, number]>([0, 0]);
    const rowsDataRef = useRef<[number, number]>([0, 0]);

    const filteredCellsRef = useRef<ICellsGridEvent[]>([]);

    const cellTileUpdatesRef = useRef<{ [cellNumber: number]: number }>({});

    const canvas2dCtxInList$ = useMemo(() => new BehaviorSubject<CanvasRenderingContext2D[]>([]), []);
    const canvasMouseEvent$ = useMemo(
        () => new Subject<[MyCanvasMouseEvents, React.MouseEvent<HTMLCanvasElement, MouseEvent>]>(),
        []
    );

    // [cells display] [cells clear] [tiles display] [tiles clear]
    const cellsGridEvent$ = useMemo(
        () =>
            new BehaviorSubject<CellsGridEventData>({
                displayCells: [],
                clearCells: [],
                displayTiles: [],
                clearTiles: [],
                highlightCells: [],
                shadeCells: [],
            }),
        []
    );

    const contractTiles$ = useMemo(() => new BehaviorSubject<{ [id: number]: [number, ITileState] }>({}), []);

    const [error, setError] = useState<[boolean, string | null]>([false, null]);

    const onBoxRef = useCallback(
        (el: HTMLDivElement | null) => {
            if (el) {
                const finalCellWidth = cellWidth;
                const rectWidth = maxCanvasWidth;
                // const rectWidth = width <= maxCanvasWidth ? width : maxCanvasWidth;
                let inRow = Math.floor((rectWidth - cellBorderWidth) / (finalCellWidth + cellBorderWidth));
                const finalWidth = (inRow + 1) * cellBorderWidth + inRow * finalCellWidth;
                const rows = Math.ceil(cellsAmount / inRow);
                const finalHeight = rows * cellHeight + rows * cellBorderWidth + cellBorderWidth;
                boxRef.current = el;
                rowsDataRef.current = [inRow, rows];
                cellsLayoutSizeRef.current = [finalWidth, finalHeight];
                setSize([finalWidth, finalHeight, true]);
            }
        },
        [boxRef, cellsLayoutSizeRef, rowsDataRef, cellsAmount, cellBorderWidth, maxCanvasWidth, cellWidth, cellHeight]
    );

    useServiceSubForCellsDisplay({
        cellsGridEvent$,
        cellsUpdate$,
        cellTileUpdatesRef,
        contractTiles$,
        event$,
        filteredCellsRef,
        modeRef,
        dataService,
    });

    useCellsUpdaterSubForGridEvents({
        cellsGridEvent$,
        cellsUpdate$,
        event$,
        filteredCellsRef,
        modeRef,
    });

    useMouseSubForGridEvents({
        boxRef,
        canvasMouseEvent$,
        cellBorderWidth,
        cellHeight,
        cellWidth,
        cellsGridEvent$,
        cellsLayoutSizeRef,
        contractTiles$,
        currentAcc$,
        modeRef,
        event$,
        filteredCellsRef,
        rowsDataRef,
    });

    return (
        <div id="cells-body" className="overflow" ref={onBoxRef}>
            <CanvasComponent
                width={sizeWithOuter[0]}
                height={sizeWithOuter[1]}
                canvas2dCtxInList$={canvas2dCtxInList$}
                event$={canvasMouseEvent$}
            />
            {sizeWithOuter[0] && sizeWithOuter[1] && (
                <CellsGrid
                    event$={cellsGridEvent$}
                    canvas2dCtxInList$={canvas2dCtxInList$}
                    amount={cellsAmount}
                    cellW={cellSize[0]}
                    cellH={cellSize[1]}
                    cellBorderWidth={cellBorderWidth}
                    canvasSize={[sizeWithOuter[0], sizeWithOuter[1]]}
                />
            )}
        </div>
    );
};

export default Component;
