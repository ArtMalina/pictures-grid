import React, { PropsWithChildren, useCallback, useRef, useState } from 'react';
import { Subject } from 'rxjs/internal/Subject';
import { CartEvents, ICartEventData } from '../interfaces/cells';


export interface IButtonProps<T = any> {
    title?: string;
    action?: T;
    noActive?: boolean;
    toggle?: undefined | 1 | 2;
    light?: boolean;
    small?: boolean;
    color?: 'header' | 'base' | 'active' | 'primary' | 'secondary' | 'info' | 'error' | 'close';
    event$?: Subject<ICartEventData | T>;
}

const Button = (props: PropsWithChildren<IButtonProps>) => {
    const { title, event$, toggle, noActive, light, small, color, action } = props;
    const [toggleState, setToggleState] = useState(toggle || 0);
    const toggleRef = useRef(toggleState);
    const onClickHandler = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event$ && toggleRef.current === 0 && event$.next(action ? { ...action } : { type: CartEvents.Close, payload: [] });
        if (toggleRef.current !== 0) {
            toggleRef.current = toggleRef.current === 1 ? 2 : 1;
            event$ && event$.next(action ? { ...action, status: toggleRef.current } : { type: CartEvents.Close, payload: [] });
            setToggleState(toggleRef.current);
        }
    }, [event$, action, toggleRef]);

    const modifiersTxt = [noActive && 'no-action', light && 'light', small && 'small', color].filter(Boolean).map(t => `btn--${t}`);
    if (toggleState === 1) modifiersTxt.push('btn--untoggled');
    if (toggleState === 2) modifiersTxt.push('btn--toggled');
    return (
        <div className={ ['btn', ...modifiersTxt].join(' ') } onClick={ onClickHandler }>
            { !toggleState && <div className="brace">[</div> }
            <div className="btn-text">{ title || '' }{ props.children }</div>
            { !toggleState && <div className="brace">]</div> }
        </div>
    );
};

export default Button;