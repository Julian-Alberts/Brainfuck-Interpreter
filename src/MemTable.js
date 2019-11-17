class MemTable {

    /**
     * @param {HTMLDivElement} memTable 
     * @param {HTMLStyleElement} styles
     * @param {number} size
     */
    constructor(memTable, styles) {
        this.memTable = memTable;
        /** @type {HTMLTableDataCellElement[][]} */
        this.memTableData = [];
        /** @type {HTMLTableHeaderCellElement[][]} */
        this.addressLabels = [[],[]];
        this.styles = styles;
        const memTableData = this.memTableData;

        let firstRow = document.createElement('tr');
        firstRow.appendChild(document.createElement('th'));
        for(let i = 0; i < 16; i++) {
            let col = document.createElement('th');
            col.textContent = '0x0' + i.toString(16).toUpperCase();
            firstRow.appendChild(col);
        }
        memTable.appendChild(firstRow);

        for(let i = 0; i < 16; i++) {
            let rowData = [];
            let row = document.createElement('tr');
            let col = document.createElement('th');
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
        this.updateMemoryPointer(0);
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

    /**
     * 
     * @param {number} pointer 
     */
    updateMemoryPointer(pointer) {
        const x = pointer % 16;
        const y = ~~(pointer / 16);
        
        this.styles.innerText = 
            `#mem-table th:nth-child(${x+2}), #mem-table td:nth-child(${x+2}), #mem-table tr:nth-child(${y+2}) {`+
                'background-color: var(--mem-highlighting);'+
            '}'+
            `#mem-table tr td:nth-child(n+${x+3}), #mem-table tr:nth-child(n+${y+3}) td {`+
                'background-color:  var(--panel-background);'+
            '}';
    }
}



