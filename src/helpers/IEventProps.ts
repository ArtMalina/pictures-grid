import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";

export interface IEventProps<T = any> {
    event$: BehaviorSubject<T>;
}