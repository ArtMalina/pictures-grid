import React, { PropsWithChildren, useCallback, useRef, useState } from 'react';
import { Subject } from 'rxjs/internal/Subject';
import { CartEvents, ICartEventData } from '../interfaces/cells';

export interface IButtonProps<T = any> {
    title?: string | number;
    action?: T;
    noActive?: boolean;
    toggle?: undefined | 1 | 2;
    group?: number;
    light?: boolean;
    noBraces?: boolean;
    fullWidth?: boolean;
    textAlign?: 'left' | 'center' | 'right';
    small?: boolean;
    color?: 'header' | 'base' | 'active' | 'primary' | 'secondary' | 'info' | 'error' | 'close';
    event$?: Subject<ICartEventData | T>;
}

const Button = (props: PropsWithChildren<IButtonProps>) => {
    const { title, event$, toggle, noActive, light, small, color, action, group, noBraces, fullWidth, textAlign } = props;
    const onClickHandler = useCallback(
        (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            event.stopPropagation();
            event.preventDefault();
            event$ && event$.next(action ? { ...action, group } : { type: CartEvents.Close, payload: [] });
        },
        [event$, action, group]
    );

    const modifiersTxt = [
        fullWidth && 'full-width',
        textAlign && `align-${textAlign}`,
        noActive && 'no-action',
        light && 'light',
        small && 'small',
        color,
    ]
        .filter(Boolean)
        .map((t) => `btn--${t}`);
    if (toggle === 1) modifiersTxt.push('btn--untoggled');
    if (toggle === 2) modifiersTxt.push('btn--toggled');
    if (group) modifiersTxt.push('btn--grouped');
    return (
        <div className={['btn', ...modifiersTxt].join(' ')} onClick={onClickHandler}>
            {!noBraces && <div className="btn_border btn_border--left"></div>}
            {!!title && <div className="btn-text">{title || ''}</div>}
            {props.children}
            {!noBraces && <div className="btn_border btn_border--right"></div>}
        </div>
    );
};

export default Button;
