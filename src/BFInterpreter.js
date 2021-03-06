class BFInterpreter {

    constructor() {
        this._code = '';
        this.onSTDOut = (_) => {};
        this.onMemChange = (pos, value) => {};
        this.onPointerChange = (pos) => {};
        this.onStop = () => {};
        this.onInstructionPointerChange = (_) => {};
        this.onBreakpoint = () => {};
        this._clockSpeed = 500;
        this.reset();
    }

    /**
     * 
     * @param {string} code
     */
    parseCode(code) {
        this.reset();
        code = code.replace(/[^.,+-<>*\[\]]/g, '');
        let openBrackets = 0;
        for (let i = 0; i < code.length; i++) {
            if (code[i] === '[') {
                openBrackets++;
            } else if (code[i] === ']') {
                openBrackets--;
            }
        }

        if (openBrackets !== 0) {
            if (openBrackets < 0) {
                throw new Error('To many closing ]');
            } else {
                throw new Error('Missing ]');
            }
        }

        this._code = code;
    }

    run() {
        this._clockId = setInterval(() => this.nextStep(), this._clockSpeed);
    }

    pause() {
        clearInterval(this._clockId);
        this._clockId = undefined;
    }

    nextStep() {
        this._instructionPointer++;
        this.onInstructionPointerChange(this._instructionPointer);
        switch(this._code[this._instructionPointer]) {
            case '>':
                this._pointerIncrement();
                break;
            case '<':
                this._pointerDecrement();
                break;
            case '+':
                this._memIncrement(this._pointer);
                break;
            case '-':
                    this._memDecrement(this._pointer);
                break;
            case '.':
                const char = String.fromCharCode(this._getMemValue(this._pointer));
                this.onSTDOut(char);
                break;
            case ',':
                if (this._stdIn === '') {
                    this._instructionPointer--;
                    return;
                } else {
                    this._setMemValue(this._pointer, this._stdIn.charCodeAt(0));
                    this._stdIn = this._stdIn.substr(1);
                }
                break;
            case '[':
                if (this._getMemValue(this._pointer) === 0) {
                    let openBrackets = 1;
                    do {
                        this._instructionPointer++;
                        switch(this._code[this._instructionPointer]) {
                            case '[':
                                openBrackets++;
                                break;
                            case ']':
                                openBrackets--;
                                break;
                        }
                    } while(openBrackets > 0 && this._code.length < this._instructionPointer);
                    this._instructionPointer++;
                    this.onInstructionPointerChange(this._instructionPointer);
                }
                break;
            case ']':
                    if (this._getMemValue(this._pointer) !== 0) {
                        let openBrackets = 1;
                        do {
                            this._instructionPointer--;
                            switch(this._code[this._instructionPointer]) {
                                case '[':
                                    openBrackets--;
                                    break;
                                case ']':
                                    openBrackets++;
                                    break;
                            }
                        } while(openBrackets > 0 && 0 <= this._instructionPointer);
                        this._instructionPointer--;
                        this.onInstructionPointerChange(this._instructionPointer);
                    }
                break;
            case '*':
                this._instructionPointer = -1;
                this.onInstructionPointerChange(this._instructionPointer);
                this.pause();
                this.onBreakpoint();
                break;
            case undefined:
                this._instructionPointer = -1;
                this.onInstructionPointerChange(this._instructionPointer);
                this.pause();
                this.onStop();
        }
    }

    reset() {
        clearInterval(this._clockId);
        this._clockId = undefined;
        this._memory = [];
        for (let i = 0; i < 256; i++) {
            this._setMemValue(i, 0);
        }
        this._pointer = 0;
        this._instructionPointer = -1;
        this.onInstructionPointerChange(this._instructionPointer);
        this._stdIn = '';
    }

    _setMemValue(pos, value) {
        value &= 255;
        this._memory[pos] = value;
        this.onMemChange(pos, value);
    }

    _getMemValue(pos) {
        return this._memory[pos];
    }

    _memIncrement(pos) {
        this._memory[pos]++;
        this._memory[pos] &= 255;
        this.onMemChange(pos, this._memory[pos]);
    }

    _memDecrement(pos) {
        this._memory[pos]--;
        this._memory[pos] &= 255;
        this.onMemChange(pos, this._memory[pos]);
    }

    _pointerIncrement() {
        this._pointer++;
        this._pointer &= 255;
        this.onPointerChange(this._pointer);
    }

    _pointerDecrement() {
        this._pointer--;
        this._pointer &= 255;
        this.onPointerChange(this._pointer);
    }

    writeToSTDIn(str) {
        if (this._stdIn === '') {
            this._stdIn = str;
        } else {
            this._stdIn += str;
        }
    }

    setClockSpeed(speed) {
        this._clockSpeed = speed;
        if (this._clockId != null) {
            this.pause();
            this.run();
        }
    }

}
