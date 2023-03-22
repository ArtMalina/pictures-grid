import React, { useEffect, useMemo, useRef } from 'react';
import './App.scss';

import Header from './containers/Header';

import CellsLayout from './containers/CellsLayout';

import { appConfig } from './AppConfig';

import { ICartEventData, ICellData, ICellEventData, TilesEventCart } from './interfaces/cells';

import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import CartModal from './containers/Cart/CartModal';
import { Subject } from 'rxjs/internal/Subject';
import { CellsEvent } from './containers/CellsLayout/CellsLayout';

import ServiceContext from './contexts/ServiceContext';
import TestDataService from './services/TestDataService';

import { AccountAddr, EMPTY_ADDR } from './services/interfaces';
import useCartStateForCellsAndService from './hooks/useCartStateForCellsAndService';
import useCartEventsToCartState from './hooks/useCartEventsToCartState';
import useCellEventsForSelectedCells from './hooks/useCellEventsForSelectedCells';

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
        dataService
            .connect()
            .then((isOk) => {
                const acc = dataService.getAccount();
                acc && currentAcc$.next(acc);
                dataService.fetchTiles().then((tiles) => console.log('%c items loaded! ', 'color: green', [...tiles]));
            })
            .catch((err) => {});
    }, [dataService, currentAcc$]);

    useCellEventsForSelectedCells({
        cellEvent$,
        selectedCells$,
        selectedCellsRef,
    });

    useCartEventsToCartState({
        cartEvent$,
        cartState$,
        cellEvent$,
        cellsUpdate$,
        dataService,
    });

    useCartStateForCellsAndService({
        cartState$,
        cellsUpdate$,
        dataService,
    });

    return (
        <div id="app-container">
            <ServiceContext.Provider value={dataService}>
                <Header event$={cartEvent$} selectedCells$={selectedCells$} />
                <CellsLayout
                    cellSize={cellSize}
                    currentAcc$={currentAcc$}
                    cellsAmount={appConfig.cellsAmount}
                    cellBorderWidth={appConfig.cellBorderWidth}
                    maxCanvasWidth={appConfig.maxCanvasWidth || 0}
                    event$={cellEvent$}
                    cellsUpdate$={cellsUpdate$}
                />
                <CartModal event$={cartState$} />
            </ServiceContext.Provider>
        </div>
    );
};

export default App;
