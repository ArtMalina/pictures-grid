import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Subject } from 'rxjs/internal/Subject';
import Button from '../../components/Button';
import { CartEvents, ICartEventData } from '../../interfaces/cells';


export interface IHeaderProps {
    event$: Subject<ICartEventData>;
}

const Header = (props: IHeaderProps) => {
    const { event$ } = props;
    const downEv$ = useMemo(() => new Subject<ICartEventData & { group?: number, status?: number }>(), []);
    const [togglesState, setToggles] = useState<[2 | 1, 2 | 1]>([1, 2]);
    const togglesStateRef = useRef(togglesState);
    useEffect(() => {
        const sub = downEv$.subscribe((ev) => {
            console.log('downEv', ev);
            console.log('downEv togglesStateRef.current', togglesStateRef.current);
            if (ev.type === CartEvents.ShowOwn) {
                if (ev.group) {
                    const [myState, allState] = togglesStateRef.current;
                    togglesStateRef.current = [myState === 1 ? 2 : 1, allState === 1 ? 2 : 1];
                    setToggles(togglesStateRef.current);
                }
                return event$.next({
                    type: togglesStateRef.current[0] === 1 ? CartEvents.ShowOther : CartEvents.ShowOwn,
                    payload: ev.payload
                });
            }
            event$.next(ev);
        });
        return () => sub.unsubscribe();
    }, [downEv$, event$, togglesStateRef]);
    return <header>
        <h1>
            <Button noActive small light color="secondary" title="Hello, crypto man" />
        </h1>
        <div style={ { backgroundColor: 'white', padding: '0 10px' } }>
        </div>
        <div className="flex-cnt">
            <Button light small color="primary" title="FILTER MY">
                <Button
                    event$={ downEv$ }
                    action={ { type: CartEvents.ShowOwn, payload: [] } }
                    light
                    small
                    noBraces
                    group={ 1 }
                    toggle={ togglesState[0] }
                    color="primary"
                    title="YES"
                />
                <Button
                    event$={ downEv$ }
                    action={ { type: CartEvents.ShowOwn, payload: [] } }
                    light
                    small
                    noBraces
                    group={ 2 }
                    toggle={ togglesState[1] }
                    color="primary"
                    title="NO"
                />
            </Button>
        </div>
        <div className="flex-cnt">
            <div className="flex-cnt item shrink mx-3">
                <Button
                    event$={ event$ }
                    action={ { type: CartEvents.Modify, payload: [] } }
                    light
                    color="info"
                    title="Modify"
                />
            </div>
            <Button
                event$={ event$ }
                action={ { type: CartEvents.Open, payload: [] } }
                color="header"
                title="Cart"
            />
        </div>
        {/* 'header' | 'base' | 'active' | 'primary' | 'secondary' | 'info' | 'error' | 'close' */ }
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
    </header>;
};

export default Header;
