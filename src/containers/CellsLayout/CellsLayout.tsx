﻿import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Subject } from 'rxjs/internal/Subject';

import ServiceContext from '../../contexts/ServiceContext';

import CanvasComponent from '../../components/Canvas';

import CellsGrid, { ICellsGridEvent } from '../../components/CellsGrid';
import { getCellByClick } from '../../helpers/canvasMath';
import { IEventProps } from '../../helpers/IEventProps';
import { ICellData, ICellEventData, ITileState, MyCanvasMouseEvents, MyModes } from '../../interfaces/cells';
import { AccountAddr, EMPTY_ADDR, IDataService } from '../../services/interfaces';


export enum CellEventTypes {
    None = 0,
    Add = 1,
    Remove = 2,
    UpdateByContract = 3
}

export interface ICellsLayoutProps extends IEventProps<ICellEventData[]> {
    cellsUpdate$: Subject<[CellEventTypes, ICellEventData[]]>;
    cellsAmount: number;
    cellSize: [number, number];
    cellBorderWidth: number;
    maxCanvasWidth: number;
}


const MAP_CURR_CELL_EV_TO_CELL_GRID_EV = (t: ICellEventData, _i: number, _arr: ICellEventData[]): ICellsGridEvent => ({
    cellNumber: t.curr.cellNumber,
    point: t.curr.point,
    mouseType: t.mouseType
})

const Component = (props: ICellsLayoutProps) => {

    // TODO: MODE from props
    const mode$ = useMemo(() => new BehaviorSubject<MyModes>(MyModes.Buy), []);

    // TODO: currentAcc from props
    const currentAcc$ = useMemo(() => new BehaviorSubject<AccountAddr>('<test-account>' as AccountAddr), []);


    const { cellSize, cellsAmount, cellBorderWidth, maxCanvasWidth, event$, cellsUpdate$ } = props;

    const dataService = useContext(ServiceContext) as IDataService;

    const [cellWidth, cellHeight] = cellSize;

    const [sizeWithOuter, setSize] = useState<[number, number, boolean]>([0, 0, false]);
    const boxRef = useRef<HTMLDivElement | null>(null);
    const cellsLayoutSizeRef = useRef<[number, number]>([0, 0]);
    const rowsDataRef = useRef<[number, number]>([0, 0]);

    const cellTileUpdatesRef = useRef<{ [cellNumber: number]: number }>({});

    const canvas2dCtxInList$ = useMemo(() => new BehaviorSubject<CanvasRenderingContext2D[]>([]), []);
    const canvasMouseEvent$ = useMemo(() => new Subject<[MyCanvasMouseEvents, React.MouseEvent<HTMLCanvasElement, MouseEvent>]>(), []);


    // [cells display] [cells clear] [tiles display] [tiles clear]
    const cellsGridEvent$ = useMemo(() => new BehaviorSubject<[ICellsGridEvent[], ICellsGridEvent[], ITileState[], ITileState[]]>([[], [], [], []]), []);

    const contractTiles$ = useMemo(() => new BehaviorSubject<{ [id: number]: [number, ITileState] }>({}), []);

    const [error, setError] = useState<[boolean, string | null]>([false, null]);

    const onBoxRef = useCallback((el: HTMLDivElement | null) => {
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
            setSize([
                finalWidth,
                finalHeight,
                true,
            ]);
        }
    }, [boxRef, cellsLayoutSizeRef, rowsDataRef, cellsAmount, cellBorderWidth, maxCanvasWidth, cellWidth, cellHeight]);

    // useEffect(() => {
    //     const sub = mode$.subscribe(mode => {
    //     });
    //     return () => sub.unsubscribe();
    // }, [mode$]);

    useEffect(() => {
        // TODO: create async funcs outside, add it with mapping (like react-connect)
        // 1. connect
        // 2. start timer (5s asking smart-contract)
        // 3. every count: get items (tiles)
        // 4. compare items from service with items of state
        // 5. new\updated items display!
        const sub = dataService.getState().subscribe(val => {
            console.log('new state', { ...val });

            const cellEventsRef = event$.getValue();

            const updatesRef = cellTileUpdatesRef.current;
            const cellEventOfIndex = cellEventsRef.reduce((acc, t, i) => ({ ...acc, [t.curr.cellNumber]: i }), {} as { [id: number]: number });
            const contractTilesData: { [id: number]: [number, ITileState]; } = {};
            let isUpdateNeeds = false;
            val.tileCells.forEach(tile => {
                // new \ updated Tile
                console.log('tile', tile, cellEventOfIndex);
                contractTilesData[tile.cellNumber] = [val.lastUpdate, { ...tile }];
                if (!updatesRef[tile.cellNumber] || updatesRef[tile.cellNumber] < val.lastUpdate) {
                    updatesRef[tile.cellNumber] = val.lastUpdate;
                    if (cellEventOfIndex[tile.cellNumber] > 0) {
                        // cellEventsRef[cellEventOfIndex[tile.cellNumber]].contractTile = { ...tile.tile };
                        isUpdateNeeds = true;
                    }
                }
            });

            if (isUpdateNeeds) {
                // event$.next([...cellEventsRef]);
                cellsUpdate$.next([CellEventTypes.UpdateByContract, [...cellEventsRef]]);
            }

            // TODO: use [ Map<CellNumber, ITileState>, ITileState[] ] as [ aTilesMap, tilesForUpdate ]
            contractTiles$.next({ ...contractTilesData });

            // const cellEvents = event$.getValue().map<ICellEventData>(t => {
            //     // const tile = val.tileCells
            // });

            cellsGridEvent$.next([
                [], [],
                [...val.tileCells], []
            ]);
        });
        return () => sub.unsubscribe();
    }, [dataService, cellsGridEvent$, event$, cellsUpdate$, contractTiles$, cellTileUpdatesRef]);

    useEffect(() => {
        const sub = cellsUpdate$.subscribe(([evType, payload]) => {
            console.log('cellsUpdate$', evType, payload);

            const cellEvents = event$.getValue();

            // TODO: update from contract event
            if (evType === CellEventTypes.UpdateByContract) {
                return;
            }

            const afterRemoveCellEvents = cellEvents
                .filter(t => t.mouseType !== MyCanvasMouseEvents.Click || payload.findIndex(x => x.curr.cellNumber === t.curr.cellNumber) < 0);


            event$.next([...afterRemoveCellEvents]);

            cellsGridEvent$.next([
                afterRemoveCellEvents.filter(t => t.mouseType === MyCanvasMouseEvents.Click).map<ICellsGridEvent>(MAP_CURR_CELL_EV_TO_CELL_GRID_EV),
                payload.map<ICellsGridEvent>(MAP_CURR_CELL_EV_TO_CELL_GRID_EV),
                [],
                []
            ]);
        });
        return () => sub.unsubscribe();
    }, [cellsUpdate$, event$, cellsGridEvent$]);

    useEffect(
        () => {

            const sub = canvasMouseEvent$.subscribe(([evType, elem]) => {
                const { clientX, clientY } = elem;
                const { offsetLeft, offsetTop } = elem.currentTarget;

                const [scrollLeft, scrollTop] = boxRef.current ? [boxRef.current.scrollLeft, boxRef.current.scrollTop] : [0, 0];

                const cellEvents = event$.getValue();

                if ((clientX - offsetLeft + scrollLeft + cellBorderWidth >= cellsLayoutSizeRef.current[0]) ||
                    (clientX <= offsetLeft) ||
                    (clientY <= offsetTop) ||
                    (clientY - offsetTop + scrollTop + cellBorderWidth >= cellsLayoutSizeRef.current[1])) {
                    const selectedCellEvents = cellEvents.filter(t => t.mouseType !== MyCanvasMouseEvents.Move);
                    cellsGridEvent$.next([
                        selectedCellEvents.map<ICellsGridEvent>(MAP_CURR_CELL_EV_TO_CELL_GRID_EV),
                        cellEvents.filter(t => t.mouseType === MyCanvasMouseEvents.Move).map<ICellsGridEvent>(MAP_CURR_CELL_EV_TO_CELL_GRID_EV),
                        [],
                        []
                    ]);
                    event$.next([...selectedCellEvents]);
                    return;
                }

                const cellData = getCellByClick(
                    clientX + scrollLeft - offsetLeft,
                    clientY + scrollTop - offsetTop,
                    { inRowCount: rowsDataRef.current[0], cellW: cellWidth + cellBorderWidth, cellH: cellHeight + cellBorderWidth }
                );

                const newCellData: ICellData = { cellNumber: cellData.cellNumber, point: [cellData.x, cellData.y] };


                if (evType === MyCanvasMouseEvents.Move && !!cellEvents.find(t => t.mouseType === evType && t.curr.cellNumber === cellData.cellNumber)) {
                    return;
                }

                // console.log('\n\n-----');
                // console.log('cellEvents', [...cellEvents]);
                // console.log('----- cellData -- ', cellData);

                // 1        move to new cell (clear last, display new Hover)
                // 2        click new cell (display new selected)
                // 3        click on selected (clear selected, display hover)
                // 4        move to selected (display Selected-Hover)
                // 5        move on the same (no action)
                // 6*        move Out (clear last --- ok)
                //  remove from EVENT:  [ click twice on the same ]

                const result: { display: ICellsGridEvent[], clear: ICellsGridEvent[], finalCellEvents: ICellEventData[] } = {
                    display: !cellEvents.length ? [{ ...newCellData, mouseType: evType }] : [],
                    clear: [],
                    finalCellEvents: !cellEvents.length ? [{ mouseType: evType, lastCell: { cellNumber: -1, point: [0, 0] }, curr: { ...newCellData } }] : []
                };

                let CLICK_TO_NEW_CELL = evType === MyCanvasMouseEvents.Click;
                let ADD_NEW_MOVE_CELL = cellEvents.length && evType === MyCanvasMouseEvents.Move;

                const MODE = mode$.getValue();
                const CURRENT_ADDR = currentAcc$.getValue();
                const contractTiles = contractTiles$.getValue();

                cellEvents.forEach(t => {

                    if (evType === MyCanvasMouseEvents.Click) {
                        // if MODE is EDIT and cell is not mine - skip!
                        // if MODE is BUY and cell is mine - skip!
                        // all above - if CURRENT_ADDR is not EMPTY
                        if (MODE === MyModes.Edit && contractTiles[t.curr.cellNumber] && contractTiles[t.curr.cellNumber][1].tile.owner !== CURRENT_ADDR) {
                            return;
                        }
                        // TODO: click for BUYING on empty cell - is OK (yet)
                        console.log('t.contractTile is buy', t.curr.cellNumber);
                        console.log('t.contractTile is CURRENT_ADDR', CURRENT_ADDR, contractTiles[t.curr.cellNumber]);
                        console.log('t.contractTile is owner', contractTiles[t.curr.cellNumber] && contractTiles[t.curr.cellNumber][1].tile.owner);
                        console.log('t.contractTile is owner == myAddr', contractTiles[t.curr.cellNumber] && contractTiles[t.curr.cellNumber][1].tile.owner === CURRENT_ADDR);
                        if (MODE === MyModes.Buy && contractTiles[t.curr.cellNumber] && contractTiles[t.curr.cellNumber][1].tile.owner === CURRENT_ADDR) {
                            return;
                        }

                        if (t.curr.cellNumber === newCellData.cellNumber && t.mouseType === evType) {
                            CLICK_TO_NEW_CELL = false;
                            // 3:  click on selected (clear selected, display hover)
                            result.clear.push({ ...t.curr, mouseType: evType });
                            // no display hover (click on hover Code [3*] do that)
                            return;
                        }
                        if (t.curr.cellNumber === newCellData.cellNumber && t.mouseType !== evType) {
                            // 3*   click on hovered (display move cell)
                            result.display.push({ ...newCellData, mouseType: MyCanvasMouseEvents.Move });
                        }
                        result.finalCellEvents.push({ ...t });
                    }
                    if (evType === MyCanvasMouseEvents.Move) {
                        if (t.mouseType === evType && t.curr.cellNumber === newCellData.cellNumber) {
                            ADD_NEW_MOVE_CELL = false;
                            // 5:  move on the same (no display, no clear)
                            result.finalCellEvents.push({ ...t });
                            return;
                        }
                        if (t.curr.cellNumber === newCellData.cellNumber && t.mouseType === MyCanvasMouseEvents.Click) {
                            // 4:  move to selected (display Selected-Hover)
                            result.finalCellEvents.push({ ...t });
                            result.display.push({ ...t.curr, mouseType: t.mouseType });
                            return;
                        }
                        if (t.mouseType === evType && t.curr.cellNumber !== newCellData.cellNumber) {
                            ADD_NEW_MOVE_CELL = false;
                            // 1:  move to new cell (clear last, display new Hover)
                            //     move to new cell
                            result.clear.push({ ...t.curr, mouseType: evType });
                            result.finalCellEvents.push({ mouseType: t.mouseType, lastCell: { ...t.curr }, curr: { ...newCellData } });
                            //     display new Hover
                            result.display.push({ ...newCellData, mouseType: evType });
                            return;
                        }
                        result.finalCellEvents.push({ ...t });
                        result.display.push({ ...t.curr, mouseType: t.mouseType });
                    }
                });

                if (ADD_NEW_MOVE_CELL) {
                    // move on new cell first time
                    result.finalCellEvents.push({ mouseType: evType, lastCell: { cellNumber: -1, point: [0, 0] }, curr: { ...newCellData } });
                    result.display.push({ ...newCellData, mouseType: evType });
                }
                if (CLICK_TO_NEW_CELL) {
                    // 2:  click new cell (display new selected)
                    if (MODE === MyModes.Buy && contractTiles[newCellData.cellNumber] && contractTiles[newCellData.cellNumber][1].tile.owner === CURRENT_ADDR) {
                        return;
                    }
                    result.finalCellEvents.push({ mouseType: evType, lastCell: { cellNumber: -1, point: [0, 0] }, curr: { ...newCellData } });
                    result.display.push({ ...newCellData, mouseType: evType });
                }
                if (result.display.length || result.clear.length) {
                    cellsGridEvent$.next([[...result.display], [...result.clear], [], []]);
                }
                // console.log('\nresult', { ...result });
                event$.next([...result.finalCellEvents]);
            });

            return () => sub.unsubscribe();

        },
        [
            boxRef,
            cellsLayoutSizeRef,
            rowsDataRef,
            event$,
            mode$,
            contractTiles$,
            currentAcc$,
            cellsGridEvent$,
            canvasMouseEvent$,
            cellBorderWidth,
            cellWidth,
            cellHeight
        ]
    );

    return (
        <div id="cells-body" ref={ onBoxRef }>
            <CanvasComponent
                width={ sizeWithOuter[0] }
                height={ sizeWithOuter[1] }
                canvas2dCtxInList$={ canvas2dCtxInList$ }
                event$={ canvasMouseEvent$ }
            />
            {
                sizeWithOuter[0] &&
                sizeWithOuter[1] &&
                <CellsGrid
                    event$={ cellsGridEvent$ }
                    canvas2dCtxInList$={ canvas2dCtxInList$ }
                    amount={ cellsAmount }
                    cellW={ cellSize[0] }
                    cellH={ cellSize[1] }
                    cellBorderWidth={ cellBorderWidth }
                    canvasSize={ [sizeWithOuter[0], sizeWithOuter[1]] }
                />
            }
        </div>
    )
};

export default Component;