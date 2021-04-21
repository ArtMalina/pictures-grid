import React, { PropsWithChildren } from 'react';
import { Subject } from 'rxjs/internal/Subject';
import { CartEvents, ICartEventData } from '../interfaces/cells';
import Button from './Button';


export interface IModalProps {
    title: string;
    width: number;
    height: number;
    event$: Subject<ICartEventData>;
}

const Modal = (props: PropsWithChildren<IModalProps>) => {
    const { title, width, height, event$ } = props;
    return (
        <div id="modal-overlay-cnt">
            <div id="modal-cnt" style={ { width, height, marginTop: -0.5 * height - 25, marginLeft: -0.5 * width } }>
                <div className="header">
                    <h2>{ title }</h2>
                    <Button
                        event$={ event$ }
                        action={ { type: CartEvents.Close, payload: [] } }
                        light
                        color="close"
                        title="Close" />
                </div>
                <div className="content">{ props.children }</div>
                <div className="footer"></div>
            </div>
        </div>
    );
};

export default Modal;