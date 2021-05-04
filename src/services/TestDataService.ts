import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { ITileState } from "../interfaces/cells";
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

const TEST_OWNER_ADDR = "<test-account>" as AccountAddr;
const TEST2_OWNER_ADDR = "<test2-account>" as AccountAddr;
const TEST3_OWNER_ADDR = "<test3-account>" as AccountAddr;
const TEST4_OWNER_ADDR = "<test4-account>" as AccountAddr;

const TILE_ID_1 = 1 as ContractTileID;
const TILE_ID_2 = 2 as ContractTileID;
const TILE_ID_3 = 3 as ContractTileID;
const TILE_ID_4 = 4 as ContractTileID;
const TILE_ID_5 = 5 as ContractTileID;
const TILE_ID_6 = 6 as ContractTileID;

const TILE_ID_140 = 140 as ContractTileID;
const TILE_ID_141 = 141 as ContractTileID;
const TILE_ID_142 = 142 as ContractTileID;
const TILE_ID_143 = 143 as ContractTileID;
const TILE_ID_144 = 144 as ContractTileID;
const TILE_ID_145 = 145 as ContractTileID;

const TILE_ID_165 = 165 as ContractTileID;
const TILE_ID_166 = 166 as ContractTileID;
const TILE_ID_167 = 167 as ContractTileID;
const TILE_ID_168 = 168 as ContractTileID;
const TILE_ID_169 = 169 as ContractTileID;
const TILE_ID_170 = 170 as ContractTileID;

const TILE_ID_190 = 190 as ContractTileID;
const TILE_ID_191 = 191 as ContractTileID;
const TILE_ID_192 = 192 as ContractTileID;
const TILE_ID_193 = 193 as ContractTileID;
const TILE_ID_194 = 194 as ContractTileID;
const TILE_ID_195 = 195 as ContractTileID;

const TOKEN_ID_1 = 1 as ContractTokenID;
const TOKEN_ID_2 = 2 as ContractTokenID;
const TOKEN_ID_3 = 3 as ContractTokenID;
const TOKEN_ID_4 = 4 as ContractTokenID;
const TOKEN_ID_5 = 5 as ContractTokenID;
const TOKEN_ID_6 = 6 as ContractTokenID;

const TEST_URLS: any = {
    1: 'https://seeklogo.com/images/S/starcraft-2-logo-A2A8CE895F-seeklogo.com.png',
    2: 'https://static10.tgstat.ru/channels/_0/8d/8d2631d77881c519b2d109c05eaa9d2b.jpg',
    // 1200x600
    5: 'https://bnetcmsus-a.akamaihd.net/cms/blog_header/ci/CIGT53U8ZP6M1509744317189.jpg',
};

let BOUNDS_FOR_140 = [
    TILE_ID_140,
    TILE_ID_141,
    TILE_ID_142,
    TILE_ID_143,
    TILE_ID_144,
    TILE_ID_145,

    TILE_ID_165,
    TILE_ID_166,
    TILE_ID_167,
    TILE_ID_168,
    TILE_ID_169,
    // TILE_ID_170,

    TILE_ID_190,
    // TILE_ID_191,
    TILE_ID_192,
    TILE_ID_193,
    TILE_ID_194,
    TILE_ID_195,
];

let TEST_TILES: ContractTileInfo[] = [
    {
        id: TILE_ID_1,
        owner: TEST_OWNER_ADDR,
        tokenId: TOKEN_ID_1,
        title: 'test 1st tile',
        url: TEST_URLS[1],
        boundedTiles: []
    },
    {
        id: TILE_ID_2,
        owner: TEST_OWNER_ADDR,
        tokenId: TOKEN_ID_2,
        title: 'test 1st tile',
        url: TEST_URLS[2],
        boundedTiles: []
    },
    {
        id: TILE_ID_5,
        owner: TEST2_OWNER_ADDR,
        tokenId: TOKEN_ID_5,
        title: 'test 2nd tile',
        url: TEST_URLS[5],
        boundedTiles: [TILE_ID_5, TILE_ID_6]
    },
    {
        id: TILE_ID_6,
        owner: TEST2_OWNER_ADDR,
        tokenId: TOKEN_ID_6,
        title: 'test 3d tile',
        url: '',
        boundedTiles: [TILE_ID_5, TILE_ID_6]
    },
    {
        id: 321 as ContractTileID,
        owner: TEST2_OWNER_ADDR,
        tokenId: 321 as ContractTokenID,
        title: 'test 3d tile',
        url: TEST_URLS[321],
        boundedTiles: []
    },

    {
        id: TILE_ID_140,
        owner: TEST2_OWNER_ADDR,
        tokenId: TOKEN_ID_5,
        title: 'test 2nd tile',
        url: TEST_URLS[5],
        boundedTiles: BOUNDS_FOR_140
    },
    {
        id: TILE_ID_141,
        owner: TEST2_OWNER_ADDR,
        tokenId: TOKEN_ID_6,
        title: 'test 3d tile',
        url: '',
        boundedTiles: BOUNDS_FOR_140
    },
    {
        id: TILE_ID_142,
        owner: TEST2_OWNER_ADDR,
        tokenId: TOKEN_ID_6,
        title: 'test 3d tile',
        url: '',
        boundedTiles: BOUNDS_FOR_140
    },
    {
        id: TILE_ID_143,
        owner: TEST2_OWNER_ADDR,
        tokenId: TOKEN_ID_6,
        title: 'test 3d tile',
        url: '',
        boundedTiles: BOUNDS_FOR_140
    },

    {
        id: TILE_ID_165,
        owner: TEST2_OWNER_ADDR,
        tokenId: TOKEN_ID_5,
        title: 'test 2nd tile',
        url: '',
        boundedTiles: BOUNDS_FOR_140
    },
    {
        id: TILE_ID_166,
        owner: TEST2_OWNER_ADDR,
        tokenId: TOKEN_ID_6,
        title: 'test 3d tile',
        url: '',
        boundedTiles: BOUNDS_FOR_140
    },
    {
        id: TILE_ID_167,
        owner: TEST2_OWNER_ADDR,
        tokenId: TOKEN_ID_6,
        title: 'test 3d tile',
        url: '',
        boundedTiles: BOUNDS_FOR_140
    },
    // {
    //     id: TILE_ID_168,
    //     owner: TEST2_OWNER_ADDR,
    //     tokenId: TOKEN_ID_6,
    //     title: 'test 3d tile',
    //     url: '',
    //     boundedTiles: BOUNDS_FOR_140
    // },

];

let TOKENS: ContractTokenInfo[] = [
    {
        id: TOKEN_ID_1,
        owner: TEST_OWNER_ADDR,
        price: '1.2',
        url: ''
    },
    {
        id: TOKEN_ID_2,
        owner: TEST_OWNER_ADDR,
        price: '1.0',
        url: ''
    },
    {
        id: TOKEN_ID_5,
        owner: TEST2_OWNER_ADDR,
        price: '2.0',
        url: ''
    },
    {
        id: TOKEN_ID_6,
        owner: TEST2_OWNER_ADDR,
        price: '2.0',
        url: ''
    },
    {
        id: 321 as ContractTokenID,
        owner: TEST2_OWNER_ADDR,
        price: '1.0',
        url: ''
    },
];


const ERROR_TOKEN: ContractTokenInfo = {
    id: -1 as ContractTokenID,
    owner: EMPTY_ADDR,
    price: '',
    url: ''
};


export default class DataService implements IDataService {
    private _account: AccountAddr | null = null;
    private _state: BehaviorSubject<DataServiceState> = new BehaviorSubject<DataServiceState>({
        lastUpdate: 0,
        tileCells: []
    });
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
        return TEST_TILES.find(t => t.id === id);
    }
    async fetchTokenInfo(id: ContractTokenID): Promise<ContractTokenInfo> {
        return TOKENS.find(t => t.id === id) || ERROR_TOKEN;
    }
    protected async fetchTokensByIds(ids: ContractTokenID[]): Promise<ContractTokenInfo[]> {
        return Promise.all(ids.map(tokenId => this.fetchTokenInfo(tokenId)));
    }

    async fetchTiles(): Promise<ContractTileInfo[]> {

        const tokenIds = TEST_TILES.reduce<ContractTokenID[]>((acc, t) => acc.includes(t.tokenId) ? acc : [...acc, t.tokenId], []);

        const tokens = await this.fetchTokensByIds(tokenIds);

        this._state.next({
            lastUpdate: new Date().getTime(),
            tileCells: TEST_TILES.map(contractTile => {
                const token = tokens.find(t => t.id === contractTile.tokenId);
                return fromContractTile(contractTile, token || ERROR_TOKEN);
            })
        });
        return [...TEST_TILES];
    }

    async groupTiles(tiles: ITileState[], groupUrl: string): Promise<[boolean, string]> {
        // 1. send to MANAGING_CONTRACT groups of tiles
        // 2. update tiles (from TIMER, but for TEST: update manually here)
        const sortedTiles = tiles.sort((a, b) => a.cellNumber > b.cellNumber ? 1 : -1);
        const firstTile = sortedTiles[0];
        console.log('%c group tiles ', 'background-color: orange; color: green', tiles);
        if (!tiles.length) {
            return [false, 'no tiles for grouping'];
        }
        TEST_TILES = TEST_TILES.reduce<ContractTileInfo[]>((acc, t) => {
            const groupingTile = sortedTiles.find(x => x.tile.id === t.id);
            console.log('grouping....', t.id, groupingTile);
            return !groupingTile ? [...acc, { ...t }] : [
                ...acc,
                {
                    ...t,
                    url: firstTile.tile.id === t.id ? groupUrl : '',
                    boundedTiles: sortedTiles.map(k => k.tile.id)
                }
            ];
        }, []);
        await this.fetchTiles();
        return [true, ''];
    }
}