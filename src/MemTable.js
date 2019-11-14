class MemTable {

    /**
     * @param {HTMLDivElement} memTable 
     */
    constructor(memTable) {
        this.memTable = memTable;
        /** @type {HTMLTableDataCellElement[][]} */
        this.memTableData = [];
        /** @type {HTMLTableHeaderCellElement[][]} */
        this.addressLabels = [[],[]];
        const memTableData = this.memTableData;
        const addressLabels = this.addressLabels;

        let firstRow = document.createElement('tr');
        firstRow.appendChild(document.createElement('th'));
        for(let i = 0; i < 16; i++) {
            let col = document.createElement('th');
            addressLabels[0].push(col);
            col.textContent = '0x0' + i.toString(16).toUpperCase();
            firstRow.appendChild(col);
        }
        memTable.appendChild(firstRow);

        for(let i = 0; i < 16; i++) {
            let rowData = [];
            let row = document.createElement('tr');
            let col = document.createElement('th');
            addressLabels[1].push(col);
            col.textContent = '0x' + i.toString(16).toUpperCase() + '0';
            row.appendChild(col);
            for(let n = 0; n < 16; n++) {
                let col = document.createElement('td');
                rowData.push(col);
                col.textContent = '0x00';
                col.title = '0x' + i.toString(16).toUpperCase() + n.toString(16).toUpperCase(); 
                row.appendChild(col);
            }
            memTableData.push(rowData);
            memTable.appendChild(row);
        }
    }

    /**
     * 
     * @param {number} pos
     * @param {number} value 
     * @param {boolean} highlight
     */
    setValue(pos, value, highlight) {
        const memTable = this.memTableData;
        let x = pos % 16;
        let y = ~~(pos / 16);
        if (value < 16) {
            value = '0x0' + value.toString(16).toUpperCase();
        } else {
            value = '0x' + value.toString(16).toUpperCase();
        }
        memTable[y][x].innerText = value;

        if (highlight) {
            memTable[y][x].classList.add('changed');

            clearTimeout(memTable[y][x].timeout);

            memTable[y][x].timeout = setTimeout(() => {
                memTable[y][x].classList.remove('changed');
            }, 500);
        }
    }
}



