import React from "react";
import { INotifyContext, INotifyMessage } from "../services/interfaces";
import { Subject } from "rxjs";

export const notifyService = {
    bus$: new Subject<INotifyMessage>(),
};

const NotifyContext = React.createContext<INotifyContext>(notifyService);

export default NotifyContext;