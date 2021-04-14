import React from "react";
import { IDataService } from "../services/interfaces";

const Context = React.createContext<IDataService | null>(null);

export default Context;