import { FirebaseApp, initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, getDoc, updateDoc, addDoc, Firestore, CollectionReference, doc } from 'firebase/firestore/lite';
import testFirebaseConfig from './testDbConfig';

import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { ITileState, IUnmintedTileState } from "../interfaces/cells";
import {
    AccountAddr,
    ContractTileID,
    ContractTileInfo,
    ContractTokenID,
    ContractTokenInfo,
    DataServiceState,
    EMPTY_ADDR,
    IDataService
} from "./interfaces";
import { fromContractTile } from "./mappers";

const TEST_OWNER_ADDR = "test-owner-3" as AccountAddr;

const ERROR_TOKEN: ContractTokenInfo = {
    _id: 1,
    id: -1 as ContractTokenID,
    owner: EMPTY_ADDR,
    price: '',
    url: ''
};

const tileToFirebaseMapper = (item: ContractTileInfo): any => {
    const idPart = item._id ? { _id: item._id } : {};
    return {
        ...idPart,
        id: '' + item.id,
        owner: item.owner,
        tokenId: '' + item.tokenId,
        title: item.title,
        url: item.url,
        boundedTiles: item.boundedTiles ? item.boundedTiles.map(t => '' + t).join(',') : ''
    };
};

const tileFirebaseMapper = (item: any): ContractTileInfo => {
    return {
        _id: item._id,
        id: (Number(item.id)) as ContractTileID,
        owner: item.owner,
        tokenId: (Number(item.tokenId)) as ContractTokenID,
        title: item.title,
        url: item.url,
        boundedTiles: item.boundedTiles ? ('' + item.boundedTiles).split(',').map(t => (Number(t)) as ContractTileID) : []
    };
};

const tokenFirebaseMapper = (item: any): ContractTokenInfo => {
    return {
        _id: item._id,
        id: (Number(item.id)) as ContractTokenID,
        owner: '' as AccountAddr,
        price: item.price,
        url: ''
    };
};

const tokenToFirebaseMapper = (item: ContractTokenInfo): any => {
    const idPart = item._id ? { _id: item._id } : {};
    return {
        ...idPart,
        id: (Number(item.id)) as ContractTokenID,
        owner: '' as AccountAddr,
        price: item.price,
        url: ''
    };
};

export default class DataService implements IDataService {
    private _account: AccountAddr | null = null;
    private _state: BehaviorSubject<DataServiceState> = new BehaviorSubject<DataServiceState>({
        lastUpdate: 0,
        tileCells: []
    });
    private _firebaseApp: FirebaseApp;
    private _db: Firestore;
    private _tilesCollection: CollectionReference;
    private _tokensCollection: CollectionReference;
    constructor() {
        this._firebaseApp = initializeApp(testFirebaseConfig);
        this._db = getFirestore(this._firebaseApp);
        this._tilesCollection = collection(this._db, 'tiles');
        this._tokensCollection = collection(this._db, 'tokens');
    }
    getState(): BehaviorSubject<DataServiceState> {
        return this._state;
    }
    connect(): Promise<boolean> {
        this._account = TEST_OWNER_ADDR;
        return new Promise(resolve => setTimeout(() => resolve(true), 2000));
    }
    getAccount(): AccountAddr | null {
        return this._account;
    }
    async getTileInfo(id: ContractTileID): Promise<ContractTileInfo | undefined> {
        try {
            const result = await getDoc(doc(this._db, 'tiles', '' + id));
            return tileFirebaseMapper({ ...result.data(), _id: result.id });
        } catch (error) {
            throw error;
        }
    }
    async fetchTokenInfo(id: ContractTokenID): Promise<ContractTokenInfo> {
        try {
            const result = await getDoc(doc(this._db, 'tokens', '' + id));
            return tokenFirebaseMapper({ ...result.data(), _id: result.id });
        } catch (error) {
            throw error;
        }
    }
    protected async fetchTokensByIds(ids: ContractTokenID[]): Promise<ContractTokenInfo[]> {
        return Promise.all(ids.map(tokenId => this.fetchTokenInfo(tokenId)));
    }

    async fetchTiles(): Promise<ContractTileInfo[]> {

        try {
            const [tilesSnapshot, tokesSnapshot] = await Promise.all([getDocs(this._tilesCollection), getDocs(this._tokensCollection)]);
            const tiles = tilesSnapshot.docs.map(doc => ({ ...doc.data(), _id: doc.id })).map(tileFirebaseMapper);
            const tokens = tokesSnapshot.docs.map(doc => ({ ...doc.data(), _id: doc.id })).map(tokenFirebaseMapper);
            console.log('%c tiles, tokens: ', 'border: 1px solid blue', tilesSnapshot.docs, tokesSnapshot.docs.map(doc => doc.data()));

            this._state.next({
                lastUpdate: new Date().getTime(),
                tileCells: tiles.map(contractTile => {
                    const token = tokens.find(t => t.id === contractTile.tokenId);
                    return fromContractTile(contractTile, token || ERROR_TOKEN);
                })
            });

            return [...tiles];

        } catch (error) {
            console.log('error with loading docs from collections: ', error);
            throw error;
        }
    }

    async groupTiles(tiles: ITileState[], groupUrl: string): Promise<[boolean, string]> {
        // 1. send to MANAGING_CONTRACT groups of tiles
        // 2. update tiles (from TIMER, but for TEST: update manually here)
        const sortedTiles = tiles.sort((a, b) => a.cellNumber > b.cellNumber ? 1 : -1);
        console.log('%c group tiles ', 'background-color: orange; color: green', tiles, [...sortedTiles]);
        if (!tiles.length) {
            return [false, 'no tiles for grouping'];
        }

        try {
            await Promise.all(
                sortedTiles.map((tileData, i) =>
                    updateDoc(doc(this._db, 'tiles', tileData.tile._id), tileToFirebaseMapper({ ...tileData.tile, url: !i ? groupUrl : '', boundedTiles: !i ? sortedTiles.map(k => k.tile.id) : [] }))
                )
            );
            await this.fetchTiles();
            return [true, ''];
        } catch (error) {
            throw error;
        }
    }

    async buyTiles(tiles: ITileState[], url: string): Promise<[boolean, string]> {
        // 1. send to MANAGING_CONTRACT groups of tiles
        // 2. update tiles (from TIMER, but for TEST: update manually here)
        console.log('%c buy tiles ', 'background-color: orange; color: darkcyan', tiles);
        if (!tiles.length) {
            return [false, 'no tiles for buying'];
        }

        const currAcc = this.getAccount();

        if (!currAcc) return [false, 'no current account'];

        try {
            await Promise.all(
                tiles.map((tileData, i) =>
                    updateDoc(doc(this._db, 'tiles', tileData.tile._id), tileToFirebaseMapper({ ...tileData.tile, url, owner: currAcc }))
                )
            );
            await this.fetchTiles();
            return [true, ''];
        } catch (error) {
            throw error;
        }
    }

    async mintTiles(tiles: IUnmintedTileState[], groupUrl: string): Promise<[boolean, string]> {

        console.log('mintTiles', tiles);

        console.log('%c mint tiles ', 'background-color: orange; color: green', tiles);

        const CURR_ADDR = this.getAccount();

        if (!CURR_ADDR) {
            return [false, 'no current account address'];
        }

        if (!tiles.length) {
            return [false, 'no tiles for minting'];
        }

        try {
            const result = await Promise.all(
                tiles.map((tileData, i) =>
                    addDoc(
                        this._tokensCollection,
                        tokenToFirebaseMapper({
                            id: tileData.cellNumber as ContractTokenID,
                            _id: undefined,
                            owner: this.getAccount() || EMPTY_ADDR,
                            price: '2.5'
                        })
                    )
                )
            );
            console.log('mint result', result);
            await Promise.all(
                tiles.map((tileData, i) =>
                    addDoc(
                        this._tilesCollection,
                        tileToFirebaseMapper({
                            id: tileData.cellNumber as ContractTileID,
                            _id: undefined,
                            boundedTiles: [],
                            owner: this.getAccount() || EMPTY_ADDR,
                            title: new Date().toLocaleString(),
                            url: groupUrl,
                            tokenId: tileData.cellNumber as ContractTokenID,
                        })
                    )
                )
            );
            await this.fetchTiles();
            return [true, ''];
        } catch (error) {
            throw error;
        }
    }
}