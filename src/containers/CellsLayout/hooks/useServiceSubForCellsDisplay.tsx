import { CellsGridEventData, ICellsGridEvent } from '@components/CellsGrid';
import { MutableRefObject, useEffect } from 'react';
import { BehaviorSubject, Subject } from 'rxjs';
import { ICellEventData, ITileState, MyCanvasMouseEvents, MyModes } from '../../../interfaces/cells';
import { IDataService } from '../../../services/interfaces';
import { CellEventTypes, CellsEvent } from '../CellsLayout';

export interface IServiceSubForCellsDisplayProps {
    dataService: IDataService;
    event$: BehaviorSubject<ICellEventData[]>;
    cellsUpdate$: Subject<CellsEvent>;
    cellsGridEvent$: BehaviorSubject<CellsGridEventData>;
    contractTiles$: BehaviorSubject<{
        [id: number]: [number, ITileState];
    }>;
    cellTileUpdatesRef: MutableRefObject<{ [cellNumber: number]: number }>;
    modeRef: MutableRefObject<MyModes>;
    filteredCellsRef: MutableRefObject<ICellsGridEvent[]>;
}

export default function useServiceSubForCellsDisplay({
    dataService,
    event$,
    cellsUpdate$,
    cellsGridEvent$,
    contractTiles$,
    cellTileUpdatesRef,
    filteredCellsRef,
    modeRef,
}: IServiceSubForCellsDisplayProps) {
    useEffect(() => {
        // TODO: create async funcs outside, add it with mapping (like react-connect)
        // 1. connect
        // 2. start timer (5s asking smart-contract)
        // 3. every count: get items (tiles)
        // 4. compare items from service with items of state
        // 5. new\updated items display!
        const sub = dataService.getState().subscribe((val) => {
            console.log('new state', { ...val });

            const cellEvents = event$.getValue();

            const updatesRef = cellTileUpdatesRef.current;
            // TODO: too complex
            const cellEventOfIndex = cellEvents.reduce(
                (acc, t, i) => ({ ...acc, [t.curr.cellNumber]: i }),
                {} as { [id: number]: number }
            );
            const contractTilesData: { [id: number]: [number, ITileState] } = {};
            let isUpdateNeeds = false;

            const displayingUpdatedTiles: ITileState[] = [];

            val.tileCells.forEach((tileData) => {
                // new \ updated Tile
                contractTilesData[tileData.cellNumber] = [val.lastUpdate, { ...tileData }];
                if (!updatesRef[tileData.cellNumber] || updatesRef[tileData.cellNumber] < tileData.tile.version + 1) {
                    updatesRef[tileData.cellNumber] = tileData.tile.version + 1;
                    displayingUpdatedTiles.push({ ...tileData });
                    if (cellEventOfIndex[tileData.cellNumber] > 0) {
                        isUpdateNeeds = true;
                    }
                }
            });

            if (isUpdateNeeds) {
                cellsUpdate$.next([CellEventTypes.UpdateByContract, [...cellEvents]]);
            }

            // TODO: use [ Map<CellNumber, ITileState>, ITileState[] ] as [ aTilesMap, tilesForUpdate ]
            contractTiles$.next({ ...contractTilesData });

            // const cellEvents = event$.getValue().map<ICellEventData>(t => {
            //     // const tile = val.tileCells
            // });

            let highlights: ICellsGridEvent[] = [];

            if (modeRef.current === MyModes.Edit) {
                highlights = val.tileCells
                    .filter((t) => t.tile && t.tile.owner === dataService.getAccount())
                    .map<ICellsGridEvent>((t) => ({
                        cellNumber: t.cellNumber,
                        mouseType: MyCanvasMouseEvents.None,
                        point: t.point,
                    }));

                filteredCellsRef.current = [...highlights];
            }

            // display updated tiles
            cellsGridEvent$.next({
                displayCells: [],
                clearCells: [],
                displayTiles: [...displayingUpdatedTiles],
                // displayTiles: [...val.tileCells],
                clearTiles: [],
                highlightCells: [...highlights],
                shadeCells: [],
            });
        });
        return () => sub.unsubscribe();
    }, [dataService, cellsGridEvent$, event$, filteredCellsRef, cellsUpdate$, contractTiles$, cellTileUpdatesRef, modeRef]);
}
