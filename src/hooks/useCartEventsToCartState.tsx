import { useEffect } from 'react';
import { BehaviorSubject, Subject } from 'rxjs';
import { CellEventTypes, CellsEvent } from '../containers/CellsLayout/CellsLayout';
import {
    CartEvents,
    ICartEventData,
    ICellEventData,
    IUnmintedTileState,
    MyCanvasMouseEvents,
    TilesEventCart,
} from '../interfaces/cells';
import { IDataService } from '../services/interfaces';

export interface ICartEventsToCartStateProps {
    dataService: IDataService;
    cartState$: Subject<TilesEventCart>;
    cellEvent$: BehaviorSubject<ICellEventData[]>;
    cartEvent$: Subject<ICartEventData>;
    cellsUpdate$: Subject<CellsEvent>;
}

export default function useCartEventsToCartState({
    dataService,
    cartState$,
    cellsUpdate$,
    cellEvent$,
    cartEvent$,
}: ICartEventsToCartStateProps) {
    useEffect(() => {
        const sub = cartEvent$.subscribe((ev) => {
            console.log('%c cartEvent ', 'border: 1px solid green', ev, dataService.getState());

            const DATA_SERVICE_STATE = dataService.getState().getValue();

            if (ev.type === CartEvents.Modify) {
                cartState$.next({
                    type: CartEvents.Modify,
                    payload: DATA_SERVICE_STATE.tileCells.filter((t) => {
                        return cellEvent$
                            .getValue()
                            .find((x) => x.mouseType === MyCanvasMouseEvents.Click && t.cellNumber === x.curr.cellNumber);
                    }),
                    groupUrl: '',
                });
            }
            if (ev.type === CartEvents.Open) {
                cartState$.next({
                    type: CartEvents.Open,
                    payload: cellEvent$
                        .getValue()
                        .filter((t) => t.mouseType === MyCanvasMouseEvents.Click)
                        .map<IUnmintedTileState>((t) => {
                            const tile = DATA_SERVICE_STATE.tileCells.find((x) => x.cellNumber === t.curr.cellNumber);
                            return {
                                cellNumber: t.curr.cellNumber,
                                point: t.curr.point,
                                tile: tile && tile.tile,
                                token: tile && tile.token,
                            };
                        }),
                    groupUrl: '',
                });
            }
            if (ev.type === CartEvents.ShowOther) {
                return cellsUpdate$.next([CellEventTypes.DisplayAll, []]);
            }
            if (ev.type === CartEvents.ShowOwn) {
                const myAccount = dataService.getAccount();
                console.log('my account: ', myAccount);
                cellsUpdate$.next([
                    CellEventTypes.DisplayOwnCells,
                    dataService
                        .getState()
                        .getValue()
                        .tileCells.filter((tileData) => tileData.tile.owner === myAccount)
                        .map<ICellEventData>((t) => ({
                            mouseType: MyCanvasMouseEvents.None,
                            curr: { cellNumber: t.cellNumber, point: t.point },
                            lastCell: { cellNumber: -1, point: [0, 0] },
                        })),
                ]);
            }
        });
        return () => sub.unsubscribe();
    }, [dataService, cartEvent$, cartState$, cellEvent$, cellsUpdate$]);
}
