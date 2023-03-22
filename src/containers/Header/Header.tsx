import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BehaviorSubject, Subject } from 'rxjs';
import Button from '@components/Button';
import { CartEvents, ICartEventData, ICellData } from '../../interfaces/cells';

export interface IHeaderProps {
    event$: Subject<ICartEventData>;
    selectedCells$: BehaviorSubject<ICellData[]>;
}

const Header = (props: IHeaderProps) => {
    const { event$, selectedCells$ } = props;
    const filterBtn$ = useMemo(() => new Subject<ICartEventData & { group?: number; status?: number }>(), []);
    const [togglesState, setToggles] = useState<[2 | 1, 2 | 1]>([1, 2]);
    const togglesStateRef = useRef(togglesState);
    const [cells, setCells] = useState<ICellData[]>([]);
    useEffect(() => {
        const sub = filterBtn$.subscribe((ev) => {
            console.log('%c filterBtn ev: ', 'background-color: brown; color: white;', ev);
            console.log('downEv togglesStateRef.current', togglesStateRef.current);
            if (ev.type === CartEvents.ShowOwn) {
                if (ev.group) {
                    const [myState, allState] = togglesStateRef.current;
                    togglesStateRef.current = [myState === 1 ? 2 : 1, allState === 1 ? 2 : 1];
                    setToggles(togglesStateRef.current);
                }
                return event$.next({
                    type: togglesStateRef.current[0] === 1 ? CartEvents.ShowOther : CartEvents.ShowOwn,
                    payload: ev.payload,
                });
            }
            event$.next(ev);
        });
        return () => sub.unsubscribe();
    }, [filterBtn$, event$, togglesStateRef]);

    useEffect(() => {
        const sub = selectedCells$.subscribe((cells) => {
            console.log('%c selectedCells ev: ', 'background-color: brown; color: white;', cells);
            setCells([...cells]);
        });
        return () => sub.unsubscribe();
    }, [selectedCells$]);

    return (
        <header>
            <div className="header_content">
                <div className="flex-cnt align-center mx-4">
                    <Button light color="header" title="Hello, crypto man" />
                </div>
                <div style={{ backgroundColor: 'white', padding: '0 10px' }}></div>
                <div className="flex-cnt align-center">
                    <div className="flex-cnt item fb-3">
                        <Button
                            light
                            small
                            color="primary"
                            title="TILES"
                            event$={filterBtn$}
                            action={{ type: CartEvents.ShowOwn, payload: [] }}
                            group={1}
                        >
                            <Button
                                event$={filterBtn$}
                                action={{ type: CartEvents.ShowOwn, payload: [] }}
                                light
                                small
                                noBraces
                                group={1}
                                toggle={togglesState[0]}
                                color="primary"
                                title="MY"
                            />
                            <Button
                                event$={filterBtn$}
                                action={{ type: CartEvents.ShowOwn, payload: [] }}
                                light
                                small
                                noBraces
                                group={2}
                                toggle={togglesState[1]}
                                color="primary"
                                title="FOR SALE"
                            />
                        </Button>
                    </div>
                    <div className="flex-cnt justify-end" style={{ width: 300 }}>
                        <div className="flex-cnt item shrink">
                            <Button
                                event$={event$}
                                action={{
                                    type: togglesStateRef.current[0] === 1 ? CartEvents.ShowOther : CartEvents.ShowOwn,
                                    payload: [],
                                }}
                                light={!!cells.length}
                                color="close"
                                title="Clear"
                            />
                        </div>
                        <div className="flex-cnt item shrink mx-3">
                            <Button
                                event$={event$}
                                action={{
                                    type: togglesState[0] === 1 ? CartEvents.Open : CartEvents.Modify,
                                    payload: [],
                                }}
                                light
                                color="info"
                                title={togglesState[0] === 1 ? 'Buy' : 'Modify'}
                            />
                        </div>
                        <div className="flex-cnt item shrink badge-cnt">
                            {!!cells.length && <div className="badge badge--info">{cells.length}</div>}
                        </div>
                    </div>
                </div>
            </div>
            {/* 'header' | 'base' | 'active' | 'primary' | 'secondary' | 'info' | 'error' | 'close' */}
            {/* <div className="flex-cnt align-center item wrap fb-6">
            <Button light color="header" title="header" />
            <Button light color="base" title="base" />
            <Button light color="active" title="active" />
            <Button light color="primary" title="primary" />
            <Button light color="secondary" title="secondary" />
            <Button light color="info" title="info" />
            <Button light color="error" title="error" />
            <Button light color="close" title="close" />
            <div className="flex-cnt justify-end align-center item" style={ { backgroundColor: 'white' } }>
                <Button color="header" title="header" />
                <Button color="base" title="base" />
                <Button color="active" title="active" />
                <Button color="primary" title="primary" />
                <Button color="secondary" title="secondary" />
                <Button color="info" title="info" />
                <Button color="error" title="error" />
                <Button color="close" title="close" />
            </div>
        </div> */}
        </header>
    );
};

export default Header;
