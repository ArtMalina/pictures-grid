import React, { useEffect, useMemo, useRef } from 'react';
import './App.scss';

import Header from './containers/Header';

import CellsLayout from './containers/CellsLayout';

import { appConfig } from './AppConfig';

import { CartEvents, ICartEventData, ICellData, ICellEventData, IUnmintedTileState, ITileState, MyCanvasMouseEvents, TilesEventCart } from './interfaces/cells';

import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import CartModal from './containers/Cart/CartModal';
import { Subject } from 'rxjs/internal/Subject';
import { CellEventTypes, CellsEvent } from './containers/CellsLayout/CellsLayout';

import ServiceContext from './contexts/ServiceContext';
import TestDataService from './services/TestDataService';
import { AccountAddr, EMPTY_ADDR } from './services/interfaces';

const App = () => {

    const cellSize: [number, number] = [appConfig.cellWidth, appConfig.cellHeight];
    console.log('%c render global app! ', 'border: 2px solid red; color: silver; background-color: darkblue;');

    const dataService = useMemo(() => new TestDataService(), []);

    const currentAcc$ = useMemo(() => new BehaviorSubject<AccountAddr>(EMPTY_ADDR), []);

    const cellEvent$ = useMemo(() => new BehaviorSubject<ICellEventData[]>([]), []);
    const selectedCells$ = useMemo(() => new BehaviorSubject<ICellData[]>([]), []);
    const selectedCellsRef = useRef<ICellData[]>([]);
    const cartEvent$ = useMemo(() => new Subject<ICartEventData>(), []);
    const cartState$ = useMemo(() => new Subject<TilesEventCart>(), []);
    const cellsUpdate$ = useMemo(() => new Subject<CellsEvent>(), []);

    useEffect(() => {
        // 1.   load tiles  [ for every tile we have to load its Token ]
        // 2.   start timer
        // 3.   in every tick: load tiles
        // 4.   find new tiles (compare timesatamps between current loaded tiles and state tiles)
        // 5.   new\updated tiles: send to eventBus (for displaying)
        dataService.connect()
            .then(isOk => {
                const acc = dataService.getAccount();
                acc && currentAcc$.next(acc);
                dataService.fetchTiles().then(tiles => console.log('%c items loaded! ', 'color: green', [...tiles]));

            })
            .catch((err) => { });
    }, [dataService, currentAcc$]);

    useEffect(() => {
        const sub = cellEvent$.subscribe((evArr) => {
            const selected = evArr.filter(t => t.mouseType === MyCanvasMouseEvents.Click).map(t => t.curr);
            const newCells: ICellData[] = [];
            let evCells = [...selected];
            const selectedState = [...selectedCellsRef.current];
            selectedState.forEach(t => {
                // store items of current stated cells if there are not in EV_CELLS
                if (!evCells.find(x => x.cellNumber === t.cellNumber)) newCells.push(t);
                // update EV_CELLS: only cells that are not stored (new)
                evCells = evCells.filter(x => x.cellNumber !== t.cellNumber);
            });
            if (evCells.length || newCells.length) {
                selectedCellsRef.current = [...selected];
                selectedCells$.next([...selected]);
            }
        });
        return () => sub.unsubscribe();
    }, [cellEvent$, selectedCells$, selectedCellsRef]);
    useEffect(() => {
        const sub = cartEvent$.subscribe((ev) => {
            console.log('%c cartEvent ', 'border: 1px solid green', ev, dataService.getState());

            const DATA_SERVICE_STATE = dataService.getState().getValue();

            if (ev.type === CartEvents.Modify) {
                cartState$.next({
                    type: CartEvents.Modify,
                    payload: DATA_SERVICE_STATE.tileCells.filter(t => {
                        return cellEvent$.getValue().find(x =>
                            x.mouseType === MyCanvasMouseEvents.Click
                            && t.cellNumber === x.curr.cellNumber);
                    }),
                    groupUrl: ''
                });
            }
            if (ev.type === CartEvents.Open) {
                cartState$.next({
                    type: CartEvents.Open,
                    payload: cellEvent$.getValue()
                        .filter(t => t.mouseType === MyCanvasMouseEvents.Click)
                        .map<IUnmintedTileState>(t => {
                            const tile = DATA_SERVICE_STATE.tileCells.find(x => x.cellNumber === t.curr.cellNumber);
                            return {
                                cellNumber: t.curr.cellNumber,
                                point: t.curr.point,
                                tile: tile && tile.tile,
                                token: tile && tile.token
                            }
                        }),
                    groupUrl: ''
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
                    dataService.getState().getValue().tileCells
                        .filter(tileData => tileData.tile.owner === myAccount)
                        .map<ICellEventData>(t => ({
                            mouseType: MyCanvasMouseEvents.None,
                            curr: { cellNumber: t.cellNumber, point: t.point },
                            lastCell: { cellNumber: -1, point: [0, 0] }
                        }))

                ]);
            }
        });
        return () => sub.unsubscribe();
    }, [dataService, cartEvent$, cartState$, cellEvent$, cellsUpdate$]);
    useEffect(() => {
        const sub = cartState$.subscribe((ev) => {
            console.log('%c cartState ', 'border: 1px solid blue', ev);

            // const DATA_SERVICE_STATE = dataService.getState().getValue();

            if (ev.type === CartEvents.SaveTiles) {
                const tiles = ev.payload.filter(t => !!t.tile && !!t.token);

                if (tiles.length) dataService.groupTiles([...tiles] as ITileState[], ev.groupUrl);
                // else {
                //     cellsUpdate$.next([CellEventTypes.DisplayAll, []]);
                //     dataService.mintTiles([...ev.payload] as IUnmintedTileState[], ev.groupUrl);
                // }
            }
            if (ev.type === CartEvents.Buy) {
                const tiles = ev.payload.filter(t => !!t.tile && !!t.token);

                if (tiles.length) dataService.buyTiles([...tiles] as ITileState[], ev.groupUrl);
                else {
                    cellsUpdate$.next([CellEventTypes.DisplayAll, []]);
                    dataService.mintTiles([...ev.payload] as IUnmintedTileState[], ev.groupUrl);
                }
            }
            if (ev.type === CartEvents.RemoveItems) {
                const tiles = ev.payload.filter(t => !!t.tile && !!t.token);
                cellsUpdate$.next([CellEventTypes.Remove, [...tiles] as ITileState[]]);
            }
            if (ev.type === CartEvents.Save) {
                const tiles = ev.payload.filter(t => !!t.tile && !!t.token);
                cellsUpdate$.next([CellEventTypes.UserUpdateTileGroup, [...tiles] as ITileState[]]);
            }
        });
        return () => sub.unsubscribe();
    }, [dataService, cellsUpdate$, cartState$, cellEvent$]);
    return (
        <div id="app-container">
            <ServiceContext.Provider value={ dataService }>
                <Header event$={ cartEvent$ } selectedCells$={ selectedCells$ } />
                <CellsLayout
                    cellSize={ cellSize }
                    currentAcc$={ currentAcc$ }
                    cellsAmount={ appConfig.cellsAmount }
                    cellBorderWidth={ appConfig.cellBorderWidth }
                    maxCanvasWidth={ appConfig.maxCanvasWidth || 0 }
                    event$={ cellEvent$ }
                    cellsUpdate$={ cellsUpdate$ }
                />
                <CartModal event$={ cartState$ } />
            </ServiceContext.Provider>
        </div>
    );
}

export default App;
