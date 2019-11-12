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
    return memTableData;
}

class FakeConsole {
    constructor() {
        this.console = document.getElementById('console');
        this._createEditableLine();
        this.console.appendChild(this.inputLine);
        this.currentOutputLine = undefined;
        this.onRead = (_) => {}
        this._stdout = '';
    }

    /**
     * 
     * @param {string} string 
     */
    writeToSTDOut(string) {
        if (this.currentOutputLine === undefined) {
            this.currentOutputLine = document.createElement('div');
            this.currentOutputLine.classList.add('std--out');
        }

        if (string.indexOf(' ') !== -1) {
            string.replace(' ', '&nsbp;');
        }

        this._stdout += string;
        this.currentOutputLine.innerText = this._stdout;

        this.console.insertBefore(this.currentOutputLine, this.inputLine);
        
        if (string === '\n') {
            this.currentOutputLine = undefined;
            this._stdout = '';
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
let pointer = document.getElementById('pointer');
let clockSpeed = document.getElementById('clock-speed');

let run = document.getElementById('run');
let pause = document.getElementById('pause');
let step = document.getElementById('step');
/** @type {HTMLButtonElement} */
let reset = document.getElementById('reset');

let isProgrammRunning = false;

cl.onRead = s => bfInterpreter.writeToSTDIn(s);
bfInterpreter.onSTDOut = s => cl.writeToSTDOut(s);
bfInterpreter.onMemChange = (pos, value) => {
    let x = pos % 16;
    let y = ~~(pos / 16);
    if (value < 16) {
        value = '0x0' + value.toString(16).toUpperCase();
    } else {
        value = '0x' + value.toString(16).toUpperCase();
    }
    memTable[y][x].innerText = value;
    memTable[y][x].classList.add('changed');

    clearTimeout(memTable[y][x].timeout);

    memTable[y][x].timeout = setTimeout(() => {
        memTable[y][x].classList.remove('changed');
    }, 500);
}

run.addEventListener('click', () => {
    if (!isProgrammRunning) {
        try {
            bfInterpreter.parseCode(codeInput.innerText);
            isProgrammRunning = true;
        } catch (e) {
            alert(e.message);
        }
    }
    reset.disabled = false;
    pause.disabled = false;
    step.disabled = true;
    run.disabled = true;
    bfInterpreter.run();
});

pause.addEventListener('click', () => {
    bfInterpreter.pause();
    reset.disabled = false;
    pause.disabled = true;
    step.disabled = false;
    run.disabled = false;
});

step.addEventListener('click', () => {
    if (!isProgrammRunning) {
        try {
            bfInterpreter.parseCode(codeInput.innerText);
        } catch (e) {
            alert(e.message);
        }
    }
    reset.disabled = false;
    pause.disabled = true;
    isProgrammRunning = true;
    bfInterpreter.nextStep();
});

reset.addEventListener('click', () => {
    bfInterpreter.reset();
    reset.disabled = true;
    pause.disabled = true;
    step.disabled = false;
    run.disabled = false;
    isProgrammRunning = false;
});

bfInterpreter.onPointerChange = p => {
    /**
     * @type {string}
     */
    p = p.toString(16).toUpperCase();
    pointer.innerText = '0x' + (p.length === 1? '0': '') + p;
    pointer.classList.add('changed');

    clearTimeout(pointer.timeout);

    pointer.timeout = setTimeout(() => {
        pointer.classList.remove('changed');
    }, 500);
}

clockSpeed.addEventListener('change', () => {
    bfInterpreter.setClockSpeed(clockSpeed.value);
});

bfInterpreter.onStop = () => {
    isProgrammRunning = false;
    reset.disabled = true;
    pause.disabled = true;
    step.disabled = false;
    run.disabled = false;
}
