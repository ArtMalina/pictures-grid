export interface IAppConfig {
    cellsAmount: number;
    inRowCells: number;
    cellWidth: number;
    cellHeight: number;
    cellBorderWidth: number;
    maxCanvasWidth: number;
}

export const appConfig: IAppConfig = {
    inRowCells: 0,
    cellsAmount: 500,
    cellWidth: 50,
    cellHeight: 50,
    cellBorderWidth: 2,
    maxCanvasWidth: 1350,
}
appConfig.inRowCells = Math.floor((appConfig.maxCanvasWidth - appConfig.cellBorderWidth) / (appConfig.cellWidth + appConfig.cellBorderWidth));
