import React from 'react';
import { Subject } from 'rxjs/internal/Subject';
import Button from '../../components/Button';
import { CartEvents, ICartEventData } from '../../interfaces/cells';


export interface IHeaderProps {
    event$: Subject<ICartEventData>;
}

const Header = (props: IHeaderProps) => {
    const { event$ } = props;
    return <header>
        <h1>
            <Button noActive small light color="header" title="Hello, crypto man" />
        </h1>
        <div style={ { backgroundColor: 'white', padding: '0 10px' } }>
        </div>
        <div className="flex-cnt">
            <Button event$={ event$ } action={ { type: CartEvents.Modify, payload: [] } } light color="info" title="Modify" />
            <Button event$={ event$ } action={ { type: CartEvents.Open, payload: [] } } color="header" title="Cart" />
        </div>
        {/* 'header' | 'base' | 'active' | 'primary' | 'secondary' | 'info' | 'error' | 'close' */ }
        {/* <div className="flex-cnt align-center item wrap fb-6">
            <Button light color="header" title="header" />
            <Button light color="base" title="base" />
            <Button light color="active" title="active" />
            <Button light color="primary" title="primary" />
            <Button light color="secondary" title="secondary" />
            <Button light color="info" title="info" />
            <Button light color="error" title="error" />
            <Button light color="close" title="close" />
            <div className="flex-cnt justify-end align-center item" style={ { backgroundColor: 'white' } }>
                <Button color="header" title="header" />
                <Button color="base" title="base" />
                <Button color="active" title="active" />
                <Button color="primary" title="primary" />
                <Button color="secondary" title="secondary" />
                <Button color="info" title="info" />
                <Button color="error" title="error" />
                <Button color="close" title="close" />
            </div>
        </div> */}
    </header>;
};

export default Header;
