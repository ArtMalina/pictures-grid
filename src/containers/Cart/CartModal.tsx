import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Subject } from 'rxjs/internal/Subject';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { CartEvents, ICartEventData, ICellEventData } from '../../interfaces/cells';

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
    const [state, setState] = useState<StateWithOpenStatus>([false]);
    const stateRef = useRef<ICellEventData[]>(state[1] || []);
    useEffect(() => {
        const sub = event$.subscribe((val) => {
            console.log('cart event', val);
            if (val.type === CartEvents.Close) {
                stateRef.current = [];
                setState([false]);
            }
            if (val.type === CartEvents.Open) {
                stateRef.current = [...val.payload];
                setState([true, [...val.payload]]);
            }
            if (val.type === CartEvents.RemoveItems) {
                stateRef.current = stateRef.current.filter(t => val.payload.findIndex(x => x.curr.cellNumber === t.curr.cellNumber) < 0);
                setState([true, [...stateRef.current]]);
            }
        });
        return () => sub.unsubscribe();
    }, [event$, modalEvent$, stateRef]);

    useEffect(() => {
        const sub = remove$.subscribe((val) => {
            console.log('remove >', val);
            event$.next({ type: CartEvents.RemoveItems, payload: [{ ...val }] });
        });
        return () => sub.unsubscribe();
    }, [event$, remove$, stateRef]);

    return (
        <div>
            {
                state[0] && <Modal title="Crypto tiles" width={ 770 } height={ 450 } event$={ event$ }>
                    <div className="flex-cnt item wrap content-start overflow">
                        <div className="flex-cnt item fb-10 wrap px-2 py-3">
                            {
                                state[1].map(cellData =>
                                    <div
                                        key={ cellData.curr.cellNumber }
                                        className="flex-cnt item wrap fb-10 align-center"
                                        style={ { padding: '4px 2px', marginBottom: 8, backgroundColor: 'white' } }
                                    >
                                        <div className="flex-cnt item fb-4">cell number: { cellData.curr.cellNumber + 1 }</div>
                                        <div className="flex-cnt item fb-3"> tile point: { cellData.curr.point.join(', ') }</div>
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