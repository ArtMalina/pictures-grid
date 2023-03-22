import { MutableRefObject, useEffect } from 'react';
import { BehaviorSubject } from 'rxjs';
import { ICellData, ICellEventData, MyCanvasMouseEvents } from '../interfaces/cells';

export interface ICellEventsForSelectedCellsProps {
    cellEvent$: BehaviorSubject<ICellEventData[]>;
    selectedCells$: BehaviorSubject<ICellData[]>;
    selectedCellsRef: MutableRefObject<ICellData[]>;
}

export default function useCellEventsForSelectedCells({
    cellEvent$,
    selectedCells$,
    selectedCellsRef,
}: ICellEventsForSelectedCellsProps) {
    useEffect(() => {
        const sub = cellEvent$.subscribe((evArr) => {
            const selected = evArr.filter((t) => t.mouseType === MyCanvasMouseEvents.Click).map((t) => t.curr);
            const newCells: ICellData[] = [];
            let evCells = [...selected];
            const selectedState = [...selectedCellsRef.current];
            selectedState.forEach((t) => {
                // store items of current stated cells if there are not in EV_CELLS
                if (!evCells.find((x) => x.cellNumber === t.cellNumber)) newCells.push(t);
                // update EV_CELLS: only cells that are not stored (new)
                evCells = evCells.filter((x) => x.cellNumber !== t.cellNumber);
            });
            if (evCells.length || newCells.length) {
                selectedCellsRef.current = [...selected];
                selectedCells$.next([...selected]);
            }
        });
        return () => sub.unsubscribe();
    }, [cellEvent$, selectedCells$, selectedCellsRef]);
}
