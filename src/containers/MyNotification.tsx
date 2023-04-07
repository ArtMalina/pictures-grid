import React, { useCallback, useContext, useEffect, useState } from 'react';
import Button from '../components/Button';
import { INotifyMessage } from '../services/interfaces';
import NotifyContext from '../contexts/NotifyContext';

export interface IMyNotificationProps {}

const MyNotification = () => {
    const [state, setState] = useState<INotifyMessage>();
    const notifyService = useContext(NotifyContext);

    const closeOnOutsideClick = useCallback((ev: React.MouseEvent<HTMLDivElement>) => {
        const target = ev.target as HTMLDivElement;
        if (target.className?.indexOf('notify-overlay-cnt') > -1) {
            setState(undefined);
        }
    }, []);

    useEffect(() => {
        const sub = notifyService.bus$.subscribe((ev) => {
            console.log('notify message: ', ev);
            setState(ev);
        });
        return () => sub.unsubscribe();
    }, [notifyService.bus$]);

    console.log('MyNotification state', state);

    if (!state) return null;

    const width = state.width || 450;
    const height = state.height || 250;

    const title = state.title || 'Attantion';

    return (
        <div className="notify-overlay-cnt" onClick={closeOnOutsideClick}>
            <div className="notify-cnt" style={{ width, height, top: '25%', marginLeft: -0.5 * width }}>
                <div className="header">
                    <Button
                        light
                        color={
                            state.type === 'success'
                                ? 'active'
                                : state.type === 'info'
                                ? 'info'
                                : state.type === 'warning'
                                ? 'header'
                                : 'error'
                        }
                        noActive
                        title={title}
                    />
                    <div className="flex-cnt">
                        <div className="flex-cnt item mx-1"></div>
                        <Button onClick={() => setState(undefined)} light color="close" title="Close" />
                    </div>
                </div>
                <div className="content px-2 py-1">{state.text}</div>
            </div>
        </div>
    );
};

export default MyNotification;
