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

const TEST_OWNER_ADDR = "test-owner-2" as AccountAddr;
// const TEST2_OWNER_ADDR = "<test2-account>" as AccountAddr;
// const TEST3_OWNER_ADDR = "<test3-account>" as AccountAddr;
// const TEST4_OWNER_ADDR = "<test4-account>" as AccountAddr;

// const TILE_ID_1 = 1 as ContractTileID;
// const TILE_ID_2 = 2 as ContractTileID;
// const TILE_ID_3 = 3 as ContractTileID;
// const TILE_ID_4 = 4 as ContractTileID;
// const TILE_ID_5 = 5 as ContractTileID;
// const TILE_ID_6 = 6 as ContractTileID;

// const TILE_ID_140 = 140 as ContractTileID;
// const TILE_ID_141 = 141 as ContractTileID;
// const TILE_ID_142 = 142 as ContractTileID;
// const TILE_ID_143 = 143 as ContractTileID;
// const TILE_ID_144 = 144 as ContractTileID;
// const TILE_ID_145 = 145 as ContractTileID;

// const TILE_ID_165 = 165 as ContractTileID;
// const TILE_ID_166 = 166 as ContractTileID;
// const TILE_ID_167 = 167 as ContractTileID;
// const TILE_ID_168 = 168 as ContractTileID;
// const TILE_ID_169 = 169 as ContractTileID;
// const TILE_ID_170 = 170 as ContractTileID;

// const TILE_ID_190 = 190 as ContractTileID;
// const TILE_ID_191 = 191 as ContractTileID;
// const TILE_ID_192 = 192 as ContractTileID;
// const TILE_ID_193 = 193 as ContractTileID;
// const TILE_ID_194 = 194 as ContractTileID;
// const TILE_ID_195 = 195 as ContractTileID;

// const TOKEN_ID_1 = 1 as ContractTokenID;
// const TOKEN_ID_2 = 2 as ContractTokenID;
// const TOKEN_ID_3 = 3 as ContractTokenID;
// const TOKEN_ID_4 = 4 as ContractTokenID;
// const TOKEN_ID_5 = 5 as ContractTokenID;
// const TOKEN_ID_6 = 6 as ContractTokenID;

// const TEST_URLS: any = {
//     1: 'https://seeklogo.com/images/S/starcraft-2-logo-A2A8CE895F-seeklogo.com.png',
//     2: 'https://static10.tgstat.ru/channels/_0/8d/8d2631d77881c519b2d109c05eaa9d2b.jpg',
//     // 1200x600
//     5: 'https://bnetcmsus-a.akamaihd.net/cms/blog_header/ci/CIGT53U8ZP6M1509744317189.jpg',
// };

// let BOUNDS_FOR_140 = [
//     TILE_ID_140,
//     TILE_ID_141,
//     TILE_ID_142,
//     TILE_ID_143,
//     TILE_ID_144,
//     TILE_ID_145,

//     TILE_ID_165,
//     TILE_ID_166,
//     TILE_ID_167,
//     TILE_ID_168,
//     TILE_ID_169,
//     // TILE_ID_170,

//     TILE_ID_190,
//     // TILE_ID_191,
//     TILE_ID_192,
//     TILE_ID_193,
//     TILE_ID_194,
//     TILE_ID_195,
// ];

// // let TEST_TILES: ContractTileInfo[] = [
// //     {
// //         _id: 1,
// //         id: TILE_ID_1,
// //         owner: TEST_OWNER_ADDR,
// //         tokenId: TOKEN_ID_1,
// //         title: 'test 1st tile',
// //         url: TEST_URLS[1],
// //         boundedTiles: []
// //     },
// //     {
// //         _id: 2,
// //         id: TILE_ID_2,
// //         owner: TEST_OWNER_ADDR,
// //         tokenId: TOKEN_ID_2,
// //         title: 'test 1st tile',
// //         url: TEST_URLS[2],
// //         boundedTiles: []
// //     },
// //     {
// //         _id: 5,
// //         id: TILE_ID_5,
// //         owner: TEST2_OWNER_ADDR,
// //         tokenId: TOKEN_ID_5,
// //         title: 'test 2nd tile',
// //         url: TEST_URLS[5],
// //         boundedTiles: [TILE_ID_5, TILE_ID_6]
// //     },
// //     {
// //         _id: 6,
// //         id: TILE_ID_6,
// //         owner: TEST2_OWNER_ADDR,
// //         tokenId: TOKEN_ID_6,
// //         title: 'test 3d tile',
// //         url: '',
// //         boundedTiles: [TILE_ID_5, TILE_ID_6]
// //     },
// //     {
// //         _id: 321,
// //         id: 321 as ContractTileID,
// //         owner: TEST2_OWNER_ADDR,
// //         tokenId: 321 as ContractTokenID,
// //         title: 'test 3d tile',
// //         url: TEST_URLS[321],
// //         boundedTiles: []
// //     },

// //     {
// //         _id: 140,
// //         id: TILE_ID_140,
// //         owner: TEST2_OWNER_ADDR,
// //         tokenId: TOKEN_ID_5,
// //         title: 'test 2nd tile',
// //         url: TEST_URLS[5],
// //         boundedTiles: BOUNDS_FOR_140
// //     },
// //     {
// //         _id: 141,
// //         id: TILE_ID_141,
// //         owner: TEST2_OWNER_ADDR,
// //         tokenId: TOKEN_ID_6,
// //         title: 'test 3d tile',
// //         url: '',
// //         boundedTiles: BOUNDS_FOR_140
// //     },
// //     {
// //         _id: 142,
// //         id: TILE_ID_142,
// //         owner: TEST2_OWNER_ADDR,
// //         tokenId: TOKEN_ID_6,
// //         title: 'test 3d tile',
// //         url: '',
// //         boundedTiles: BOUNDS_FOR_140
// //     },
// //     {
// //         _id: 143,
// //         id: TILE_ID_143,
// //         owner: TEST2_OWNER_ADDR,
// //         tokenId: TOKEN_ID_6,
// //         title: 'test 3d tile',
// //         url: '',
// //         boundedTiles: BOUNDS_FOR_140
// //     },

// //     {
// //         _id: 165,
// //         id: TILE_ID_165,
// //         owner: TEST2_OWNER_ADDR,
// //         tokenId: TOKEN_ID_5,
// //         title: 'test 2nd tile',
// //         url: '',
// //         boundedTiles: BOUNDS_FOR_140
// //     },
// //     {
// //         _id: 166,
// //         id: TILE_ID_166,
// //         owner: TEST2_OWNER_ADDR,
// //         tokenId: TOKEN_ID_6,
// //         title: 'test 3d tile',
// //         url: '',
// //         boundedTiles: BOUNDS_FOR_140
// //     },
// //     {
// //         _id: 167,
// //         id: TILE_ID_167,
// //         owner: TEST2_OWNER_ADDR,
// //         tokenId: TOKEN_ID_6,
// //         title: 'test 3d tile',
// //         url: '',
// //         boundedTiles: BOUNDS_FOR_140
// //     },
// //     // {
// //     //     id: TILE_ID_168,
// //     //     owner: TEST2_OWNER_ADDR,
// //     //     tokenId: TOKEN_ID_6,
// //     //     title: 'test 3d tile',
// //     //     url: '',
// //     //     boundedTiles: BOUNDS_FOR_140
// //     // },

// // ];

// // let TOKENS: ContractTokenInfo[] = [
// //     {
// //         _id: 1,
// //         id: TOKEN_ID_1,
// //         owner: TEST_OWNER_ADDR,
// //         price: '1.2',
// //         url: ''
// //     },
// //     {
// //         _id: 1,
// //         id: TOKEN_ID_2,
// //         owner: TEST_OWNER_ADDR,
// //         price: '1.0',
// //         url: ''
// //     },
// //     {
// //         _id: 1,
// //         id: TOKEN_ID_5,
// //         owner: TEST2_OWNER_ADDR,
// //         price: '2.0',
// //         url: ''
// //     },
// //     {
// //         _id: 1,
// //         id: TOKEN_ID_6,
// //         owner: TEST2_OWNER_ADDR,
// //         price: '2.0',
// //         url: ''
// //     },
// //     {
// //         _id: 1,
// //         id: 321 as ContractTokenID,
// //         owner: TEST2_OWNER_ADDR,
// //         price: '1.0',
// //         url: ''
// //     },
// // ];


const ERROR_TOKEN: ContractTokenInfo = {
    _id: 1,
    id: -1 as ContractTokenID,
    owner: EMPTY_ADDR,
    price: '',
    url: ''
};

// boundedTiles: "2,3"
// description: ""
// id: "2"
// owner: "test-owner-1"
// params: ""
// title: "sc2"
// tokenId: "2"
// url:

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

        // const tokenIds = tiles.reduce<ContractTokenID[]>((acc, t) => acc.includes(t.tokenId) ? acc : [...acc, t.tokenId], []);

        // const tokens = await this.fetchTokensByIds(tokenIds);

        // this._state.next({
        //     lastUpdate: new Date().getTime(),
        //     tileCells: TEST_TILES.map(contractTile => {
        //         const token = tokens.find(t => t.id === contractTile.tokenId);
        //         return fromContractTile(contractTile, token || ERROR_TOKEN);
        //     })
        // });
        // return [...TEST_TILES];
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
        // TEST_TILES = TEST_TILES.reduce<ContractTileInfo[]>((acc, t) => {
        //     const groupingTile = sortedTiles.find(x => x.tile.id === t.id);
        //     console.log('grouping....', t.id, groupingTile);
        //     return !groupingTile ? [...acc, { ...t }] : [
        //         ...acc,
        //         {
        //             ...t,
        //             url: firstTile.tile.id === t.id ? groupUrl : '',
        //             boundedTiles: sortedTiles.map(k => k.tile.id)
        //         }
        //     ];
        // }, []);
        // await this.fetchTiles();
        // return [true, ''];
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
        // TEST_TILES = TEST_TILES.reduce<ContractTileInfo[]>((acc, t) => {
        //     const groupingTile = sortedTiles.find(x => x.tile.id === t.id);
        //     console.log('grouping....', t.id, groupingTile);
        //     return !groupingTile ? [...acc, { ...t }] : [
        //         ...acc,
        //         {
        //             ...t,
        //             url: firstTile.tile.id === t.id ? groupUrl : '',
        //             boundedTiles: sortedTiles.map(k => k.tile.id)
        //         }
        //     ];
        // }, []);
        // await this.fetchTiles();
        // return [true, ''];
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
        // tiles.forEach(t => {
        //     TEST_TILES.push({
        //         _id: t.cellNumber,
        //         id: (t.cellNumber) as ContractTileID,
        //         owner: CURR_ADDR,
        //         tokenId: (t.cellNumber) as ContractTokenID,
        //         title: new Date().toLocaleString(),
        //         url: groupUrl,
        //         boundedTiles: []
        //     });

        //     TOKENS.push({
        //         id: (t.cellNumber) as ContractTokenID,
        //         owner: CURR_ADDR,
        //         price: t.token ? t.token.price : '2.5',
        //         url: groupUrl,
        //     });
        // });
        // await this.fetchTiles();
        // return [true, ''];
    }
}