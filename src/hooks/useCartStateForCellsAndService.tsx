import { useEffect } from 'react';
import { Subject } from 'rxjs';
import { CellEventTypes, CellsEvent } from '../containers/CellsLayout/CellsLayout';
import { CartEvents, ITileState, IUnmintedTileState, TilesEventCart } from '../interfaces/cells';
import { FormTileData, IDataService } from '../services/interfaces';

export interface ICartStateForCellsAndServiceProps {
    dataService: IDataService;
    cartState$: Subject<TilesEventCart>;
    cellsUpdate$: Subject<CellsEvent>;
}

export default function useCartStateForCellsAndService({ dataService, cartState$, cellsUpdate$ }: ICartStateForCellsAndServiceProps) {
    useEffect(() => {
        const sub = cartState$.subscribe((ev) => {
            console.log('%c cartState ', 'border: 1px solid blue', ev);

            if (ev.type === CartEvents.SaveTiles) {
                // TASK: update TILE BOUNDS when regrouping!
                const tiles = ev.payload.filter((t) => !!t.tile && !!t.token);

                if (tiles.length) dataService.groupTiles([...tiles] as ITileState[], ev.params || {});
                // else {
                //     cellsUpdate$.next([CellEventTypes.DisplayAll, []]);
                //     dataService.mintTiles([...ev.payload] as IUnmintedTileState[], ev.groupUrl);
                // }
            }
            if (ev.type === CartEvents.Buy) {
                const tiles = ev.payload.filter((t) => !!t.tile && !!t.token);

                let tileData: Partial<FormTileData> = ev.params ? { ...ev.params } : {};
                tileData.url = tileData.url || ev.groupUrl;

                if (tiles.length) {
                    cellsUpdate$.next([CellEventTypes.DisplayAll, []]);
                    dataService.buyTiles([...tiles] as ITileState[], tileData);
                } else {
                    cellsUpdate$.next([CellEventTypes.DisplayAll, []]);
                    dataService.mintTiles([...ev.payload] as IUnmintedTileState[], tileData);
                }
            }
            if (ev.type === CartEvents.RemoveItems) {
                const tiles = ev.payload.filter((t) => !!t.tile && !!t.token);
                cellsUpdate$.next([CellEventTypes.Remove, [...tiles] as ITileState[]]);
            }
            if (ev.type === CartEvents.Save) {
                const tiles = ev.payload.filter((t) => !!t.tile && !!t.token);
                cellsUpdate$.next([CellEventTypes.UserUpdateTileGroup, [...tiles] as ITileState[]]);
            }
        });
        return () => sub.unsubscribe();
    }, [dataService, cellsUpdate$, cartState$]);
}
