function setupTable() {
    let memTable = document.getElementById('mem-table');
    let firstRow = document.createElement('tr');
    firstRow.appendChild(document.createElement('th'));
    for(let i = 0; i < 16; i++) {
        let col = document.createElement('th');
        col.textContent = '0x0' + i.toString(16).toUpperCase();
        firstRow.appendChild(col);
    }
    memTable.appendChild(firstRow);

    let memTableData = [];
    for(let i = 0; i < 16; i++) {
        let rowData = [];
        let row = document.createElement('tr');
        let col = document.createElement('th');
        col.textContent = '0x' + i.toString(16).toUpperCase() + '0';
        row.appendChild(col);
        for(let i = 0; i < 16; i++) {
            let col = document.createElement('td');
            rowData.push(col);
            col.textContent = '0x00';
            row.appendChild(col);
        }
        memTableData.push(rowData);
        memTable.appendChild(row);
    }
    return memTableData;
}

class FakeConsole {
    constructor() {
        this.console = document.getElementById('console');
        this._createEditableLine();
        this.console.appendChild(this.inputLine);
        this.currentOutputLine = undefined;
        this.onRead = (_) => {}
    }

    writeToConsole(string) {
        if (this.currentOutputLine === undefined) {
            this.currentOutputLine = document.createElement('div');
            this.currentOutputLine.classList.add('std--out');
        }
        
        this.currentOutputLine.innerText += string;
        this.console.insertBefore(this.currentOutputLine, this.inputLine);
        
        if (string === '\n') {
            this.currentOutputLine = undefined;
        }
    }

    /**
     * @returns {HTMLDivElement}
     */
    _createEditableLine() {
        let line = document.createElement('input');
        line.classList.add('std--in');
        line.placeholder = 'Input';
        line.addEventListener('change', _ => this._onInputChange())
        this.inputLine = line;
    }

    _onInputChange() {
        const value = this.inputLine.value;
        const line = document.createElement('div');
        line.classList.add('std--in');
        line.innerText = value;
        this.inputLine.value = '';
        this.console.insertBefore(line, this.inputLine);
        this.onRead(value + '\n');
    }
}

let cl = new FakeConsole();
let memTable = setupTable();
let bfInterpreter = new BFInterpreter();
let codeInput = document.getElementById('code');
let run = document.getElementById('run');
let pointer = document.getElementById('pointer');

cl.onRead = s => bfInterpreter.writeToSTDIn(s);
bfInterpreter.onSTDOut = s => cl.writeToConsole(s);
bfInterpreter.onMemChange = (pos, value) => {
    let x = pos % 16;
    let y = ~~(pos / 16);
    if (value < 16) {
        value = '0x0' + value.toString(16);
    } else {
        value = '0x' + value.toString(16);
    }
    memTable[y][x].innerText = value;
    memTable[y][x].classList.add('changed');

    clearTimeout(memTable[y][x].timeout);

    memTable[y][x].timeout = setTimeout(() => {
        memTable[y][x].classList.remove('changed');
    }, 500);
}

run.addEventListener('click', () => {
    bfInterpreter.parseCode(codeInput.innerText);
    bfInterpreter.run();
});

bfInterpreter.onPointerChange = p => {
    pointer.innerText = p;
}

