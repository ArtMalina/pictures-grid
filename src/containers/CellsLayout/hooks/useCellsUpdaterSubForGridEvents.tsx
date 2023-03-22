import { CellsGridEventData, ICellsGridEvent } from '@components/CellsGrid';
import { MutableRefObject, useEffect } from 'react';
import { BehaviorSubject, Subject } from 'rxjs';
import { MAP_CURR_CELL_EV_TO_CELL_GRID_EV } from '../../../helpers/grid';
import { ICellEventData, MyCanvasMouseEvents, MyModes } from '../../../interfaces/cells';
import { CellEventTypes, CellsEvent } from '../CellsLayout';

export interface ICellsUpdaterSubForGridEventsProps {
    event$: BehaviorSubject<ICellEventData[]>;
    cellsUpdate$: Subject<CellsEvent>;
    cellsGridEvent$: BehaviorSubject<CellsGridEventData>;
    modeRef: MutableRefObject<MyModes>;
    filteredCellsRef: MutableRefObject<ICellsGridEvent[]>;
}

export default function useCellsUpdaterSubForGridEvents({
    event$,
    cellsUpdate$,
    cellsGridEvent$,
    filteredCellsRef,
    modeRef,
}: ICellsUpdaterSubForGridEventsProps) {
    useEffect(() => {
        const sub = cellsUpdate$.subscribe((ev) => {
            const evType = ev[0],
                payload = ev[1];
            console.log('cellsUpdate$', evType, payload);

            const cellEvents = event$.getValue();
            if (evType === CellEventTypes.DisplayAll || evType === CellEventTypes.DisplayOwnCells) {
                const unhighlightCells = evType === CellEventTypes.DisplayAll ? [...filteredCellsRef.current] : [];
                modeRef.current = evType === CellEventTypes.DisplayAll ? MyModes.Buy : MyModes.Edit;
                filteredCellsRef.current = (ev[1] as ICellEventData[]).map<ICellsGridEvent>((t) => ({
                    cellNumber: t.curr.cellNumber,
                    point: t.curr.point,
                    mouseType: MyCanvasMouseEvents.None,
                }));
                const notHighlightedSelected = cellEvents
                    .filter(
                        (t) =>
                            t.mouseType === MyCanvasMouseEvents.Click &&
                            unhighlightCells.findIndex((x) => x.cellNumber === t.curr.cellNumber) < 0
                    )
                    .map<ICellsGridEvent>((t) => ({
                        cellNumber: t.curr.cellNumber,
                        point: t.curr.point,
                        mouseType: t.mouseType,
                    }));
                event$.next(cellEvents.filter((t) => t.mouseType !== MyCanvasMouseEvents.Click));
                // 1. display border of selected!
                return cellsGridEvent$.next({
                    displayCells: [],
                    clearCells: [...unhighlightCells, ...notHighlightedSelected],
                    displayTiles: [],
                    clearTiles: [],
                    highlightCells: [...filteredCellsRef.current],
                    shadeCells: [],
                });
            }

            // TODO: update from contract event
            if (evType === CellEventTypes.UpdateByContract) {
                return;
            }

            if (evType === CellEventTypes.Remove) {
                const afterRemoveCellEvents = cellEvents.filter(
                    (t) =>
                        t.mouseType !== MyCanvasMouseEvents.Click ||
                        ev[1].findIndex((x) => x.cellNumber === t.curr.cellNumber) < 0
                );

                event$.next([...afterRemoveCellEvents]);

                cellsGridEvent$.next({
                    displayCells: afterRemoveCellEvents
                        .filter((t) => t.mouseType === MyCanvasMouseEvents.Click)
                        .map<ICellsGridEvent>(MAP_CURR_CELL_EV_TO_CELL_GRID_EV),
                    clearCells: ev[1].map<ICellsGridEvent>((t) => ({
                        cellNumber: t.cellNumber,
                        point: t.point,
                        mouseType: MyCanvasMouseEvents.Click,
                    })),
                    displayTiles: [],
                    clearTiles: [],
                    highlightCells: [],
                    shadeCells: [],
                });

                return;
            }

            // const afterRemoveCellEvents = cellEvents
            //     .filter(t => t.mouseType !== MyCanvasMouseEvents.Click || payload.findIndex(x => x.curr.cellNumber === t.curr.cellNumber) < 0);

            // event$.next([...afterRemoveCellEvents]);

            // cellsGridEvent$.next({
            //     displayCells: afterRemoveCellEvents.filter(t => t.mouseType === MyCanvasMouseEvents.Click).map<ICellsGridEvent>(MAP_CURR_CELL_EV_TO_CELL_GRID_EV),
            //     clearCells: payload.map<ICellsGridEvent>(MAP_CURR_CELL_EV_TO_CELL_GRID_EV),
            //     displayTiles: [],
            //     clearTiles: [],
            //     highlightCells: [],
            //     shadeCells: []
            // });
        });
        return () => sub.unsubscribe();
    }, [cellsUpdate$, event$, cellsGridEvent$, modeRef, filteredCellsRef]);
}
