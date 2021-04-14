import React, { useCallback } from 'react';
import { BehaviorSubject, Subject } from 'rxjs';
import { MyCanvasMouseEvents } from '../interfaces/cells';


export interface ICanvasProps {
    width: number;
    height: number;
    canvas2dCtxInList$: BehaviorSubject<CanvasRenderingContext2D[]>;
    event$: Subject<[MyCanvasMouseEvents, React.MouseEvent<HTMLCanvasElement, MouseEvent>]>;
}

const Component = (props: ICanvasProps) => {
    const { width, height, event$, canvas2dCtxInList$ } = props;
    const onClick = useCallback((event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        event$.next([MyCanvasMouseEvents.Click, event]);
    }, [event$]);
    const onMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        event$.next([MyCanvasMouseEvents.Move, event]);
    }, [event$]);

    const setCanvasElement = useCallback((el: HTMLCanvasElement | null) => {
        if (el && !canvas2dCtxInList$.getValue().length) {
            const ctx = el.getContext('2d');
            if (ctx) canvas2dCtxInList$.next([ctx]);
        }
    }, [canvas2dCtxInList$]);

    return (
        <div id="canvas-container" style={ { width, height } }>
            <canvas
                id="canvas"
                onClick={ onClick }
                onMouseMove={ onMouseMove }
                onMouseLeave={ onMouseMove }
                width={ width }
                height={ height }
                ref={ setCanvasElement }>
            </canvas>
        </div>
    );
};

export default Component;