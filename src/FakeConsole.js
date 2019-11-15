class FakeConsole {

    /**
     * 
     * @param {HTMLDivElement} console 
     */
    constructor(console) {
        this.console = console;
        this._stdin = '';
        this._stdoutLine = document.createElement('pre');
        this.console.appendChild(this._stdoutLine);
        this.onRead = (_) => {};
        this.console.addEventListener('keydown', ev => this._keyDown(ev));
    }

    /**
     * 
     * @param {string} string 
     */
    writeToSTDOut(string) {
        const lines = string.split('\n');
        lines.forEach((line, index) => {
            if (index === lines.length - 1) {
                this._stdoutLine.innerText += line;
            } else {
                this._stdoutLine.innerText += line;
                this._stdoutLine = document.createElement('pre');
                this.console.appendChild(this._stdoutLine);
            }
        });
    }

    /**
     * 
     * @param {KeyboardEvent} ev 
     */
    _keyDown(ev) {
        const key = ev.key;
        if (key.length > 1) {
            switch(key) {
                case 'Enter':
                    this.writeToSTDOut('\n')
                    this.onRead(this._stdin + '\n');
                    this._stdin = '';
                    break;
                case 'Backspace':
                    if (this._stdoutLine.innerText === this._stdin) {
                        this._stdin = this._stdin.slice(0, -1);
                        this._stdoutLine.innerText = this._stdin;
                    }
                    break;
            }
        } else {
            this._stdin += key;
            this._stdoutLine.innerText = this._stdin;
        }
    }

}
