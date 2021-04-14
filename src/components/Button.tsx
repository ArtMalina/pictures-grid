import React, { PropsWithChildren, useCallback } from 'react';
import { Subject } from 'rxjs/internal/Subject';
import { CartEvents, ICartEventData } from '../interfaces/cells';


export interface IButtonProps<T = any> {
    title?: string;
    action?: T;
    noActive?: boolean;
    light?: boolean;
    small?: boolean;
    color?: 'header' | 'base' | 'active' | 'primary' | 'secondary' | 'info' | 'error' | 'close';
    event$?: Subject<ICartEventData | T>;
}

const Button = (props: PropsWithChildren<IButtonProps>) => {
    const { title, event$, noActive, light, small, color, action } = props;
    const onClickHandler = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event$ && event$.next(action || { type: CartEvents.Close, payload: [] });
    }, [event$, action]);

    const modifiersTxt = [noActive && 'no-action', light && 'light', small && 'small', color].filter(Boolean).map(t => `btn--${t}`);

    return (
        <div className={ ['btn', ...modifiersTxt].join(' ') } onClick={ onClickHandler }>
            <div className="brace">[</div><div className="btn-text">{ title || '' }{ props.children }</div><div className="brace">]</div>
        </div>
    );
};

export default Button;