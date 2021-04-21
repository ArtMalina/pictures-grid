import React, { PropsWithChildren, useCallback, useRef, useState } from 'react';
import { Subject } from 'rxjs/internal/Subject';
import { CartEvents, ICartEventData } from '../interfaces/cells';


export interface IButtonProps<T = any> {
    title?: string;
    action?: T;
    noActive?: boolean;
    toggle?: undefined | 1 | 2;
    group?: number;
    light?: boolean;
    small?: boolean;
    color?: 'header' | 'base' | 'active' | 'primary' | 'secondary' | 'info' | 'error' | 'close';
    event$?: Subject<ICartEventData | T>;
}

const Button = (props: PropsWithChildren<IButtonProps>) => {
    const { title, event$, toggle, noActive, light, small, color, action, group } = props;
    const onClickHandler = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event$ && event$.next(action ? { ...action, group } : { type: CartEvents.Close, payload: [] });
    }, [event$, action, group]);

    const modifiersTxt = [noActive && 'no-action', light && 'light', small && 'small', color].filter(Boolean).map(t => `btn--${t}`);
    if (toggle === 1) modifiersTxt.push('btn--untoggled');
    if (toggle === 2) modifiersTxt.push('btn--toggled');
    if (group) modifiersTxt.push('btn--grouped');
    return (
        <div className={ ['btn', ...modifiersTxt].join(' ') } onClick={ onClickHandler }>
            {  <div className="brace">[</div> }
            <div className="btn-text">{ title || '' }{ props.children }</div>
            {  <div className="brace">]</div> }
        </div>
    );
};

export default Button;