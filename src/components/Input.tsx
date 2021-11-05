import React, { PropsWithChildren, useCallback, useState } from 'react';
import { Subject } from 'rxjs/internal/Subject';


export interface IInputProps<T = any> {
    title?: string;
    value?: string;
    action?: T;
    noActive?: boolean;
    light?: boolean;
    small?: boolean;
    color?: 'header' | 'base' | 'active' | 'primary' | 'secondary' | 'info' | 'error' | 'close';
    event$?: Subject<[string, T]>;
}

const Input = (props: PropsWithChildren<IInputProps>) => {
    const { value, event$, noActive, light, small, color, action } = props;
    const [state, setState] = useState(value || '');
    const onChangeHandler = useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
        setState(event.currentTarget.value);
        event$ && event$.next([event.currentTarget.value, action]);
    }, [event$, action]);

    const modifiersTxt = [noActive && 'no-action', light && 'light', small && 'small', color].filter(Boolean).map(t => `text-input--${t}`);
    return (
        <div className={ ['text-input', ...modifiersTxt].join(' ') }>
            <input type="text" value={ state } onChange={ onChangeHandler } disabled={ noActive } />
        </div>
    );
};

export default Input;