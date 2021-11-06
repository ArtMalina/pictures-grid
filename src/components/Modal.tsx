import React, { PropsWithChildren, useEffect, useState } from 'react';
import { Subject } from 'rxjs/internal/Subject';
import { CartEvents, TilesEventCart } from '../interfaces/cells';
import Button from './Button';


export interface IModalProps {
    title: string;
    width: number;
    height: number;
    event$: Subject<TilesEventCart>;
    open: boolean;
}

const Modal = (props: PropsWithChildren<IModalProps>) => {
    const { title, width, height, event$, open } = props;
    const [state, setState] = useState<TilesEventCart>({ type: CartEvents.Close, payload: [], groupUrl: '' });
    useEffect(() => {
        console.log('useEffect in modal....');
        const sub = event$.subscribe(ev => {
            console.log('ev in modal: ', ev);
            if ([CartEvents.Modify, CartEvents.Open].includes(ev.type)) setState(ev);
        });
        return () => sub.unsubscribe();
    }, [event$]);

    console.log('Modal state', state);

    if (!open) return null;

    const ifNewCell = !!state.payload.filter(t => !t.token && !t.tile).length;
    let BTN_TITLE = state && state.type === CartEvents.Modify ? "Save" : "Buy";
    BTN_TITLE = state && state.type === CartEvents.Open ? "Buy" : BTN_TITLE;
    BTN_TITLE = ifNewCell ? 'Mint' : BTN_TITLE;

    const EV_NAME = state && state.type === CartEvents.Open || ifNewCell ? CartEvents.Buy : CartEvents.Save;

    return (
        <div id="modal-overlay-cnt">
            <div id="modal-cnt" style={ { width, height, top: '25%', marginLeft: -0.5 * width } }>
                <div className="header">
                    <Button light color="header" noActive title={ title } />
                    <div className="flex-cnt">
                        <Button
                            event$={ event$ }
                            action={ { type: EV_NAME, payload: [] } }
                            light
                            color="active"
                            title={ BTN_TITLE } />
                        <div className="flex-cnt item mx-1"></div>
                        <Button
                            event$={ event$ }
                            action={ { type: CartEvents.Close, payload: [] } }
                            light
                            color="close"
                            title="Close" />
                    </div>
                </div>
                <div className="content">{ props.children }</div>
                <div className="footer"></div>
            </div>
        </div>
    );
};

export default Modal;