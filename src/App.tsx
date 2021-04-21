import React, { useEffect, useMemo } from 'react';
import './App.scss';

import Header from './containers/Header';

import CellsLayout from './containers/CellsLayout';

import { appConfig } from './AppConfig';

import { CartEvents, ICartEventData, ICellEventData, MyCanvasMouseEvents } from './interfaces/cells';

import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import CartModal from './containers/Cart/CartModal';
import { Subject } from 'rxjs/internal/Subject';
import { CellEventTypes } from './containers/CellsLayout/CellsLayout';

import ServiceContext from './contexts/ServiceContext';
import TestDataService from './services/TestDataService';

const App = () => {

    const cellSize: [number, number] = [appConfig.cellWidth, appConfig.cellHeight];
    console.log('%c render global app! ', 'border: 2px solid red; color: silver; background-color: darkblue;');

    const dataService = useMemo(() => new TestDataService(), []);

    const cellEvent$ = useMemo(() => new BehaviorSubject<ICellEventData[]>([]), []);
    const cartEvent$ = useMemo(() => new Subject<ICartEventData>(), []);
    const cartState$ = useMemo(() => new Subject<ICartEventData>(), []);
    const cellsUpdate$ = useMemo(() => new Subject<[CellEventTypes, ICellEventData[]]>(), []);

    useEffect(() => {
        // 1.   load tiles  [ for every tile we have to load its Token ]
        // 2.   start timer
        // 3.   in every tick: load tiles
        // 4.   find new tiles (compare timesatamps between current loaded tiles and state tiles)
        // 5.   new\updated tiles: send to eventBus (for displaying)
        dataService.connect()
            .then(isOk => {
                dataService.fetchTiles().then(tiles => console.log('%c items loaded! ', 'color: green', [...tiles]));

            })
            .catch((err) => { });
    }, [dataService]);

    useEffect(() => {
        const sub = cellEvent$.subscribe((evArr) => {
            evArr.forEach(({ curr }) => {
                // console.log('%c cellNumber ', 'border: 1px solid green', curr.cellNumber + 1);
            });
        });
        return () => sub.unsubscribe();
    }, [cellEvent$]);
    useEffect(() => {
        const sub = cartEvent$.subscribe((ev) => {
            console.log('%c cartEvent ', 'border: 1px solid green', ev, dataService.getState());
            if (ev.type === CartEvents.Open) {
                cartState$.next({ type: CartEvents.Open, payload: cellEvent$.getValue().filter(t => t.mouseType === MyCanvasMouseEvents.Click) });
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
                        .filter(tile => tile.token.owner === myAccount)
                        .map<ICellEventData>(t => ({
                            mouseType: MyCanvasMouseEvents.None,
                            curr: { cellNumber: t.cellNumber, point: t.point },
                            lastCell: { cellNumber: -1, point: [0, 0] }
                        }))

                ]);
            }
        });
        return () => sub.unsubscribe();
    }, [cartEvent$, cartState$, cellEvent$, cellsUpdate$]);
    useEffect(() => {
        const sub = cartState$.subscribe((ev) => {
            console.log('%c cartState ', 'border: 1px solid blue', ev);
            if (ev.type === CartEvents.RemoveItems) {
                cellsUpdate$.next([CellEventTypes.Remove, [...ev.payload]]);
            }
        });
        return () => sub.unsubscribe();
    }, [cellsUpdate$, cartState$, cellEvent$]);
    return (
        <div id="app-container">
            <ServiceContext.Provider value={ dataService }>
                <Header event$={ cartEvent$ } />
                <CellsLayout
                    cellSize={ cellSize }
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
