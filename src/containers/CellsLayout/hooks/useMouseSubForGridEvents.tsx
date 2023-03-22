import { CellsGridEventData, ICellsGridEvent } from '@components/CellsGrid';
import { MutableRefObject, useEffect } from 'react';
import { BehaviorSubject, Subject } from 'rxjs';
import { getCellByClick } from '../../../helpers/canvasMath';
import { MAP_CURR_CELL_EV_TO_CELL_GRID_EV } from '../../../helpers/grid';
import { ICellData, ICellEventData, ITileState, MyCanvasMouseEvents, MyModes } from '../../../interfaces/cells';
import { AccountAddr } from '../../../services/interfaces';

export interface IMouseSubForGridEventsProps {
    canvasMouseEvent$: Subject<[MyCanvasMouseEvents, React.MouseEvent<HTMLCanvasElement, MouseEvent>]>;
    currentAcc$: BehaviorSubject<AccountAddr>;
    event$: BehaviorSubject<ICellEventData[]>;
    cellsGridEvent$: BehaviorSubject<CellsGridEventData>;
    contractTiles$: BehaviorSubject<{
        [id: number]: [number, ITileState];
    }>;
    modeRef: MutableRefObject<MyModes>;
    cellsLayoutSizeRef: MutableRefObject<[number, number]>;
    rowsDataRef: MutableRefObject<[number, number]>;
    boxRef: MutableRefObject<HTMLDivElement | null>;
    filteredCellsRef: MutableRefObject<ICellsGridEvent[]>;
    cellBorderWidth: number;
    cellWidth: number;
    cellHeight: number;
}

export default function useMouseSubForGridEvents({
    canvasMouseEvent$,
    event$,
    currentAcc$,
    cellsGridEvent$,
    contractTiles$,
    filteredCellsRef,
    cellsLayoutSizeRef,
    rowsDataRef,
    modeRef,
    boxRef,
    cellBorderWidth,
    cellHeight,
    cellWidth,
}: IMouseSubForGridEventsProps) {
    useEffect(() => {
        const sub = canvasMouseEvent$.subscribe(([evType, elem]) => {
            const { clientX, clientY } = elem;
            const { offsetLeft, offsetTop } = elem.currentTarget;

            const [scrollLeft, scrollTop] = boxRef.current ? [boxRef.current.scrollLeft, boxRef.current.scrollTop] : [0, 0];

            const cellEvents = event$.getValue();

            // mouse out of grid layout
            if (
                clientX - offsetLeft + scrollLeft + cellBorderWidth >= cellsLayoutSizeRef.current[0] ||
                clientX <= offsetLeft ||
                clientY <= offsetTop ||
                clientY - offsetTop + scrollTop + cellBorderWidth >= cellsLayoutSizeRef.current[1]
            ) {
                const selectedCellEvents = cellEvents.filter((t) => t.mouseType !== MyCanvasMouseEvents.Move);
                cellsGridEvent$.next({
                    displayCells: selectedCellEvents.map<ICellsGridEvent>(MAP_CURR_CELL_EV_TO_CELL_GRID_EV),
                    clearCells: cellEvents
                        .filter(
                            (t) =>
                                t.mouseType === MyCanvasMouseEvents.Move &&
                                filteredCellsRef.current.findIndex((ft) => ft.cellNumber === t.curr.cellNumber) < 0
                        )
                        .map<ICellsGridEvent>(MAP_CURR_CELL_EV_TO_CELL_GRID_EV),
                    displayTiles: [],
                    clearTiles: [],
                    highlightCells: [...filteredCellsRef.current],
                    shadeCells: [],
                });
                event$.next([...selectedCellEvents]);
                return;
            }

            const cellData = getCellByClick(clientX + scrollLeft - offsetLeft, clientY + scrollTop - offsetTop, {
                inRowCount: rowsDataRef.current[0],
                cellW: cellWidth + cellBorderWidth,
                cellH: cellHeight + cellBorderWidth,
            });

            const newCellData: ICellData = {
                cellNumber: cellData.cellNumber,
                point: [cellData.x, cellData.y],
            };

            if (
                evType === MyCanvasMouseEvents.Move &&
                !!cellEvents.find((t) => t.mouseType === evType && t.curr.cellNumber === cellData.cellNumber)
            ) {
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

            const MODE = modeRef.current;
            const CURRENT_ADDR = currentAcc$.getValue();
            const contractTiles = contractTiles$.getValue();

            let CLICK_TO_NEW_CELL = evType === MyCanvasMouseEvents.Click;
            let ADD_NEW_MOVE_CELL = cellEvents.length && evType === MyCanvasMouseEvents.Move;

            const EDIT_NOT_MINE_TILE_OE_EMPTY =
                MODE === MyModes.Edit &&
                CLICK_TO_NEW_CELL &&
                (!contractTiles[newCellData.cellNumber] ||
                    contractTiles[newCellData.cellNumber][1].tile.owner !== CURRENT_ADDR);

            if (EDIT_NOT_MINE_TILE_OE_EMPTY) CLICK_TO_NEW_CELL = false;
            const result: {
                display: ICellsGridEvent[];
                clear: ICellsGridEvent[];
                finalCellEvents: ICellEventData[];
            } = {
                display: !cellEvents.length && !EDIT_NOT_MINE_TILE_OE_EMPTY ? [{ ...newCellData, mouseType: evType }] : [],
                clear: [],
                finalCellEvents:
                    !cellEvents.length && !EDIT_NOT_MINE_TILE_OE_EMPTY
                        ? [
                              {
                                  mouseType: evType,
                                  lastCell: { cellNumber: -1, point: [0, 0] },
                                  curr: { ...newCellData },
                              },
                          ]
                        : [],
            };

            cellEvents.forEach((t) => {
                if (evType === MyCanvasMouseEvents.Click) {
                    // console.log('%c cell event', 'background-color: darkcyan; color: white', t);
                    // if MODE is EDIT and cell is not mine - skip!
                    // if MODE is BUY and cell is mine - skip!
                    // all above - if CURRENT_ADDR is not EMPTY
                    // console.log('%c ev ', 'color: green', t, contractTiles[t.curr.cellNumber], CURRENT_ADDR);

                    // click to new cell that is not mine or empty in EDIT MODE
                    if (
                        MODE === MyModes.Edit &&
                        t.mouseType === MyCanvasMouseEvents.Click &&
                        (!contractTiles[t.curr.cellNumber] ||
                            contractTiles[t.curr.cellNumber][1].tile.owner !== CURRENT_ADDR)
                    ) {
                        CLICK_TO_NEW_CELL = false;
                        return;
                    }
                    // click on another cell: display selected owned tiles!
                    if (MODE === MyModes.Edit && t.mouseType === MyCanvasMouseEvents.Click && !EDIT_NOT_MINE_TILE_OE_EMPTY) {
                        if (t.curr.cellNumber !== newCellData.cellNumber) {
                            result.display.push({ ...t.curr, mouseType: t.mouseType });
                        }
                    }
                    // TODO: click for BUYING on empty cell - is OK (yet)
                    // console.log('t.contractTile is buy', t.curr.cellNumber);
                    // console.log('t.contractTile is CURRENT_ADDR', CURRENT_ADDR, contractTiles[t.curr.cellNumber]);
                    // console.log('t.contractTile is owner', contractTiles[t.curr.cellNumber] && contractTiles[t.curr.cellNumber][1].tile.owner);
                    // console.log('t.contractTile is owner == myAddr', contractTiles[t.curr.cellNumber] && contractTiles[t.curr.cellNumber][1].tile.owner === CURRENT_ADDR);
                    if (
                        MODE === MyModes.Buy &&
                        t.mouseType === MyCanvasMouseEvents.Click &&
                        contractTiles[t.curr.cellNumber] &&
                        contractTiles[t.curr.cellNumber][1].tile.owner === CURRENT_ADDR
                    ) {
                        return;
                    }

                    if (MODE === MyModes.Buy) {
                        // click on new [ NON-EDIT mode ]
                        // - ignore selected (only one selected is allowed)
                        if (t.curr.cellNumber !== newCellData.cellNumber) {
                            // result.clear.push({ ...t.curr, mouseType: evType });
                            // return;
                        }
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
                        result.display.push({
                            ...newCellData,
                            mouseType: MyCanvasMouseEvents.Move,
                        });
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
                        result.finalCellEvents.push({
                            mouseType: t.mouseType,
                            lastCell: { ...t.curr },
                            curr: { ...newCellData },
                        });
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
                result.finalCellEvents.push({
                    mouseType: evType,
                    lastCell: { cellNumber: -1, point: [0, 0] },
                    curr: { ...newCellData },
                });
                result.display.push({ ...newCellData, mouseType: evType });
            }
            if (CLICK_TO_NEW_CELL) {
                // 2:  click new cell (display new selected)
                if (
                    MODE === MyModes.Buy &&
                    contractTiles[newCellData.cellNumber] &&
                    contractTiles[newCellData.cellNumber][1].tile.owner === CURRENT_ADDR
                ) {
                    return;
                }
                result.finalCellEvents.push({
                    mouseType: evType,
                    lastCell: { cellNumber: -1, point: [0, 0] },
                    curr: { ...newCellData },
                });
                result.display.push({ ...newCellData, mouseType: evType });
            }
            if (evType === MyCanvasMouseEvents.Click) {
                if (EDIT_NOT_MINE_TILE_OE_EMPTY) {
                    result.finalCellEvents = result.finalCellEvents.filter((t) => t.mouseType !== MyCanvasMouseEvents.Click);
                }
                console.log('final res', CLICK_TO_NEW_CELL, { ...result });
            }
            if (result.display.length || result.clear.length) {
                cellsGridEvent$.next({
                    displayCells: [...result.display],
                    clearCells: result.clear.filter(
                        (t) => filteredCellsRef.current.findIndex((ft) => ft.cellNumber === t.cellNumber) < 0
                    ),
                    displayTiles: [],
                    clearTiles: [],
                    highlightCells: filteredCellsRef.current.filter(
                        (t) => result.display.findIndex((ct) => ct.cellNumber === t.cellNumber) < 0
                    ),
                    shadeCells: [],
                });
            }
            if (evType === MyCanvasMouseEvents.Click) {
                console.log('\nresult', { ...result });
            }
            event$.next([...result.finalCellEvents]);
        });

        return () => sub.unsubscribe();
    }, [
        boxRef,
        cellsLayoutSizeRef,
        rowsDataRef,
        event$,
        modeRef,
        contractTiles$,
        currentAcc$,
        cellsGridEvent$,
        canvasMouseEvent$,
        filteredCellsRef,
        cellBorderWidth,
        cellWidth,
        cellHeight,
    ]);
}
