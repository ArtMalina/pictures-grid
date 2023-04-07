// SPDX-License-Identifier: MIT
pragma solidity >=0.4.0 <0.9.0;

contract CellGrid {
    event UpdateGridCellsOwning(
        uint number,
        address newOwner,
        address prevOwner,
        uint price,
        string newUrl,
        string newTitle
    );

    address contractOwner;

    uint constant MAX_CELL_LINKS = 25;
    uint constant MINT_PRICE = 1 ether;

    struct GridCell {
        uint number;
        address owner;
        uint price;
        string url;
        string title;
        uint[MAX_CELL_LINKS] links;
        uint linksLen;
    }

    mapping(uint => GridCell) public cells;

    modifier onlyOwner() {
        require(msg.sender == contractOwner, 'not an owner');
        _;
    }

    function isRootCell(uint cellNumber) public view returns (bool) {
        return cells[cellNumber].linksLen > 1 && cells[cellNumber].links[0] == cellNumber;
    }

    function buy(uint cellNumber, uint price, string memory title, string memory url) public payable {
        require(cells[cellNumber].owner != address(0), 'not minted');
        require(msg.value == cells[cellNumber].price, 'not enough Eth');

        address oldOwner = cells[cellNumber].owner;

        cells[cellNumber].owner = msg.sender;
        cells[cellNumber].url = url;
        cells[cellNumber].title = title;
        delete cells[cellNumber].links;

        payable(oldOwner).transfer(msg.value);

        emit UpdateGridCellsOwning(cellNumber, msg.sender, oldOwner, price, url, title);
    }

    function mint(uint cellNumber, uint price, string memory title, string memory url) public payable {
        require(cells[cellNumber].owner == address(0), 'owned');
        require(msg.value == MINT_PRICE, 'not enough Eth');

        cells[cellNumber].owner = msg.sender;
        cells[cellNumber].url = url;
        cells[cellNumber].title = title;

        payable(contractOwner).transfer(msg.value);

        emit UpdateGridCellsOwning(cellNumber, msg.sender, address(0), price, url, title);
    }

    function getCellsPrices(uint[] memory cellNumbers) public view returns (uint) {
        uint acc;
        for (uint i = 0; i < MAX_CELL_LINKS; i++) {
            acc = acc + cells[cellNumbers[i]].price;
        }
        return acc;
    }

    function checkIndices(uint[] memory cellNumbers) public pure returns (bool) {
        for (uint i = 1; i < MAX_CELL_LINKS; i++) {
            if (cellNumbers[0] > cellNumbers[i]) return false;
        }
        return true;
    }

    function buyGroup(
        uint[] memory cellNumbers,
        uint price,
        string memory groupUrl,
        string memory rootTitle
    ) public payable {
        require(cellNumbers.length < MAX_CELL_LINKS, 'to much cells');
        uint neededPrice = getCellsPrices(cellNumbers);
        require(msg.value == neededPrice, 'not enough ethers');
        require(checkIndices(cellNumbers), '1st cell is not root');

        cells[cellNumbers[0]].price = price;
        cells[cellNumbers[0]].url = groupUrl;
        cells[cellNumbers[0]].title = rootTitle;
    }
}
