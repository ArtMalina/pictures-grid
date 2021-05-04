import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BehaviorSubject } from 'rxjs';
import { Subject } from 'rxjs/internal/Subject';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import { CartEvents, ICartEventData, ICellEventData, ITileState } from '../../interfaces/cells';

export interface ICartModalProps {
    event$: Subject<ICartEventData>;
}

type StateWithOpenVariant = [true, ICellEventData[]];
type StateWithCloseVariant = [false];
type StateWithOpenStatus = StateWithOpenVariant | StateWithCloseVariant;

const CartModal = (props: ICartModalProps) => {
    const { event$ } = props;
    const modalEvent$ = useMemo(() => new Subject(), []);
    const remove$ = useMemo(() => new Subject<ICellEventData>(), []);
    const cartEvent$ = useMemo(() => new Subject<ICartEventData>(), []);
    const input$ = useMemo(() => new BehaviorSubject<[string, any]>(['', null]), []);
    const [state, setState] = useState<StateWithOpenStatus>([false]);
    const stateRef = useRef<ICellEventData[]>(state[1] || []);
    const [tilesState, setTilesState] = useState<[boolean, ITileState[]]>([false, []]);
    const tilesRef = useRef<ITileState[]>([]);
    useEffect(() => {
        const launcherSub = event$.subscribe(val => {
            if (val.type === CartEvents.Open) {
                stateRef.current = [...val.payload];
                setState([true, [...val.payload]]);
                setTilesState([false, []]);
            }
            if (val.type === CartEvents.Modify) {
                tilesRef.current = [...val.payload];
                setTilesState([true, [...val.payload]]);
                setState([false]);
            }
        });
        const sub = cartEvent$.subscribe((val) => {
            console.log('cart event', val);
            if (val.type === CartEvents.Close || val.type === CartEvents.Save) {
                if (val.type === CartEvents.Save) {
                    if (tilesRef.current.length) {
                        event$.next({
                            type: CartEvents.SaveTiles,
                            payload: [...tilesRef.current],
                            groupUrl: input$.getValue()[0]
                        });
                    } else {
                        event$.next(val);
                    }
                }
                stateRef.current = [];
                tilesRef.current = [];
                setState([false]);
                setTilesState([false, []]);
            }

            if (val.type === CartEvents.RemoveItems) {
                stateRef.current = stateRef.current.filter(t => val.payload.findIndex(x => x.curr.cellNumber === t.curr.cellNumber) < 0);
                setState([true, [...stateRef.current]]);
                event$.next(val);
            }
        });
        return () => {
            launcherSub.unsubscribe();
            sub.unsubscribe();
        };
    }, [event$, modalEvent$, stateRef, tilesRef, input$]);

    useEffect(() => {
        const sub = remove$.subscribe((val) => {
            console.log('remove >', val);
            cartEvent$.next({ type: CartEvents.RemoveItems, payload: [{ ...val }] });
        });
        return () => sub.unsubscribe();
    }, [event$, remove$, stateRef]);

    const groupAvatarUrl = tilesState[1].reduce<string>((acc, t) => {
        if (acc && t.tile.url) return '';
        return t.tile.url || acc;
    }, '');

    return (
        <div>
            {
                (state[0] || tilesState[0]) && <Modal title="Crypto tiles" width={ 770 } height={ 450 } event$={ cartEvent$ }>
                    <div className="flex-cnt item wrap content-start overflow px-2">
                        {
                            tilesState[0] && <div className="flex-cnt item wrap fb-10 px-2 my-2">
                                <Button color="secondary" noActive title={ tilesState[1].length > 1 ? 'group url' : "url" } small />
                                <Input event$={ input$ } value={ groupAvatarUrl } />
                            </div>
                        }
                        <div className="flex-cnt item justify-start fb-10 wrap px-2 py-3">
                            {
                                tilesState[0] && tilesState[1].length > 1 && <div className="flex-cnt item fb-10 my-2">
                                    <Button color="secondary" noActive title="group tiles" small />
                                </div>
                            }
                            {
                                tilesState[1].map(cellData =>
                                    <div
                                        key={ cellData.cellNumber }
                                        className="flex-cnt item wrap fb-2 align-center shrink mx-1 px-3 py-4"
                                        style={ { marginBottom: 8, backgroundColor: 'white' } }
                                    >
                                        <div className="flex-cnt item fb-4 modal_cell-item">{ cellData.cellNumber + 1 }</div>
                                        {/* <div className="flex-cnt item fb-3"> tile point: { cellData.curr.point.join(', ') }</div> */ }
                                        <div className="flex-cnt item fb-3 justify-end">
                                            <Button action={ cellData } light color="error" title="X" small event$={ remove$ } />
                                        </div>
                                    </div>
                                )
                            }
                            {
                                state[1] && state[1].map(cellData =>
                                    <div
                                        key={ cellData.curr.cellNumber }
                                        className="flex-cnt item wrap fb-2 align-center shrink mx-1 px-3 py-4"
                                        style={ { marginBottom: 8, backgroundColor: 'white' } }
                                    >
                                        <div className="flex-cnt item fb-4 modal_cell-item">{ cellData.curr.cellNumber + 1 }</div>
                                        {/* <div className="flex-cnt item fb-3"> tile point: { cellData.curr.point.join(', ') }</div> */ }
                                        <div className="flex-cnt item fb-3 justify-end">
                                            <Button action={ cellData } light color="error" title="X" small event$={ remove$ } />
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </Modal>
            }
        </div>
    );
};

export default CartModal;