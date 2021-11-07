import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BehaviorSubject } from 'rxjs';
import { Subject } from 'rxjs/internal/Subject';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import { CartEvents, TilesEventCart, ICellEventData, IUnmintedTileState } from '../../interfaces/cells';
import { ContractTileInfo } from '../../services/interfaces';

export interface ICartModalProps {
    event$: Subject<TilesEventCart>;
}

enum CartOpenTypes {
    None = 0,
    BuyCellsMode = 1,
    ModifyCellsMode = 2,
}

type StateWithOpenVariant = [true, ICellEventData[]];
type StateWithCloseVariant = [false];
type StateWithOpenStatus = StateWithOpenVariant | StateWithCloseVariant;

const CartModal = (props: ICartModalProps) => {
    const { event$ } = props;
    const modalEvent$ = useMemo(() => new Subject(), []);
    const remove$ = useMemo(() => new Subject<IUnmintedTileState>(), []);
    const cartEvent$ = useMemo(() => new Subject<TilesEventCart>(), []);

    const [tilesState, setTilesState] = useState<[CartOpenTypes, IUnmintedTileState[]]>([CartOpenTypes.None, []]);
    const tilesRef = useRef<IUnmintedTileState[]>([]);

    const groupAvatarUrl = tilesState[1].reduce<string>((acc, t) => {
        if (!t.tile) return acc;
        if (acc && t.tile.url) return '';
        return t.tile.url || acc;
    }, '');

    const input$ = useMemo(() => new BehaviorSubject<[string, keyof ContractTileInfo | null]>([groupAvatarUrl || '', null]), [groupAvatarUrl]);
    const inputDataRef = useRef<Partial<ContractTileInfo>>({});

    useEffect(() => { 
        const sub = input$.subscribe(([val, key]) => {
            if (key) {
                inputDataRef.current[key] = val;
            }
        });
        return () => sub.unsubscribe();
    }, [input$, inputDataRef]);

    // const [state, setState] = useState<StateWithOpenStatus>([false]);
    // const stateRef = useRef<ICellEventData[]>(state[1] || []);
    useEffect(() => {
        const launcherSub = event$.subscribe(val => {
            console.log('%c event$ in cart-modal: ', 'border: 1px solid green', val, input$.getValue());
            // if (val.type === CartEvents.Open) {
            //     stateRef.current = [...val.payload];
            //     setState([true, [...val.payload]]);
            //     setTilesState([false, []]);
            // }
            if (val.type === CartEvents.Modify || val.type === CartEvents.Open) {
                input$.next(['', null]);
                tilesRef.current = [...val.payload];
                setTilesState([val.type === CartEvents.Modify ? CartOpenTypes.ModifyCellsMode : CartOpenTypes.BuyCellsMode, [...val.payload]]);
                cartEvent$.next(val);
            }
        });
        const sub = cartEvent$.subscribe((val) => {
            console.log('cart event', val, [...tilesRef.current]);
            if ([CartEvents.Close, CartEvents.Save, CartEvents.Buy].includes(val.type)) {
                if (val.type === CartEvents.Buy) {
                    if (tilesRef.current.length) {
                        event$.next({
                            type: CartEvents.Buy,
                            payload: tilesRef.current.map(t => ({ ...t })),
                            groupUrl: input$.getValue()[0]
                        });
                    }
                } else if (val.type === CartEvents.Save) {
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
                tilesRef.current = [];
                input$.next(['', null]);
                setTilesState([CartOpenTypes.None, []]);
            }

            if (val.type === CartEvents.RemoveItems) {
                tilesRef.current = tilesRef.current.filter(t => val.payload.findIndex(x => x.cellNumber === t.cellNumber) < 0);
                setTilesState([CartOpenTypes.ModifyCellsMode, [...tilesRef.current]]);
                event$.next(val);
            }
        });
        return () => {
            launcherSub.unsubscribe();
            sub.unsubscribe();
        };
    }, [event$, modalEvent$, tilesRef, input$]);

    useEffect(() => {
        const sub = remove$.subscribe((val) => {
            console.log('remove >', val);
            cartEvent$.next({ type: CartEvents.RemoveItems, payload: [{ ...val }], groupUrl: '' });
        });
        return () => sub.unsubscribe();
    }, [event$, remove$]);

    console.log('state CartModal: ', tilesState);

    return (
        <div>
            {
                <Modal title="Crypto tiles" width={ 770 } height={ 450 } event$={ cartEvent$ } open={ tilesState[0] !== CartOpenTypes.None }>
                    <div className="flex-cnt item wrap content-start overflow px-2">
                        {
                            tilesState[0] === CartOpenTypes.ModifyCellsMode && <div className="flex-cnt item wrap fb-10 px-2 my-2">
                                <Button color="secondary" noActive title={ tilesState[1].length > 1 ? 'group url' : "url" } small />
                                <Input event$={ input$ } value={ groupAvatarUrl } />
                            </div>
                        }
                        <div className="flex-cnt item justify-start fb-10 wrap px-2 py-3">
                            {
                                tilesState[0] === CartOpenTypes.ModifyCellsMode && tilesState[1].length > 1 && <div className="flex-cnt item fb-10 my-2">
                                    <Button color="secondary" noActive title="group tiles" small />
                                </div>
                            }
                            {
                                tilesState[0] === CartOpenTypes.ModifyCellsMode && tilesState[1].map(cellData =>
                                    <div
                                        key={ cellData.cellNumber }
                                        className="flex-cnt item wrap fb-2 align-center shrink mx-1 px-3 py-1"
                                        style={ { marginBottom: 8, backgroundColor: 'white' } }
                                    >
                                        <div className="flex-cnt item fb-4 modal_cell-item">{ cellData.cellNumber + 1 }</div>
                                        <div className="flex-cnt item fb-3 justify-end">
                                            <Button action={ cellData } light color="error" title="X" small event$={ remove$ } />
                                        </div>
                                    </div>
                                )
                            }
                            {
                                tilesState[0] === CartOpenTypes.BuyCellsMode && <div className="flex-cnt item wrap justify-start fb-10">
                                    {
                                        tilesState[1].map(cellData =>
                                            <div
                                                key={ cellData.cellNumber }
                                                className="flex-cnt item wrap fb-10 align-center shrink mx-1 px-3 py-1"
                                                style={ { marginBottom: 8, backgroundColor: 'white' } }
                                            >
                                                <div className="flex-cnt item fb-4 shrink">
                                                    <Button color="close" textAlign="left" noActive title="price (Eth)" small />
                                                </div>
                                                <div className="flex-cnt item justify-end fb-4">
                                                    <Button color="info" noActive title={ `# ${cellData.cellNumber + 1}` } small />
                                                </div>
                                                <div className="flex-cnt item shrink fb-10 mt-1 mb-4">
                                                    <Input noActive color="header" value={ cellData.token ? '' + cellData.token.price : '' } />
                                                </div>
                                                <div className="flex-cnt item fb-4 shrink">
                                                    <Button color="close" textAlign="left" noActive title="image url" small />
                                                </div>
                                                <div className="flex-cnt item fb-10 mt-1 mb-4">
                                                    <Input event$={ input$ } noActive={ !!cellData.tile } value={ cellData.tile ? cellData.tile.url || '' : '' } />
                                                </div>
                                                <div className="flex-cnt item fb-4 shrink">
                                                    <Button color="close" textAlign="left" noActive title="title" small />
                                                </div>
                                                <div className="flex-cnt item shrink fb-10 mt-1 mb-4">
                                                    <Input noActive color="header" value={ cellData.tile ? '' + cellData.tile.title : '' } />
                                                </div>
                                                <div className="flex-cnt item fb-4 shrink">
                                                    <Button color="close" textAlign="left" noActive title="bounded tiles" small />
                                                </div>
                                                <div className="flex-cnt item shrink fb-10 wrap">
                                                    {
                                                        cellData.tile &&
                                                        cellData.tile.boundedTiles.map(x =>
                                                            <div key={ x.toString() } className="flex-cnt item shrink my-1 mx-2">
                                                                <Button color="base" noActive title={ x.toString() } small />
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                                <div className="flex-cnt item fb-4 mt-4 shrink">
                                                    <Button color="close" textAlign="center" noActive title="owner address" small />
                                                </div>
                                                <div className="flex-cnt item shrink fb-10 mt-1 mb-4">
                                                    <Input noActive color="header" value={ cellData.tile ? '' + cellData.tile.owner : '' } />
                                                </div>
                                            </div>
                                        )
                                    }
                                </div>
                            }
                        </div>
                    </div>
                </Modal>
            }
        </div>
    );
};

export default CartModal;