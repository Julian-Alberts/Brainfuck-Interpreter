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
