/**
 * 
 * @param {string} code 
 */
function parseCode(code) {
    let parsedCode = '';
    for (let i = 0; i < code.length; i++) {
        if (/[.,+-<>*\[\]]/g.test(code[i])) {
            let span = `<span>${code[i]}</span>`;
            parsedCode += span;
        } else if (code[i] === '\n') {
            parsedCode += '</br>';
        } else {
            parsedCode += `<pre>${code[i]}</pre>`
        }
    }

    return parsedCode;
}

let cl = new FakeConsole();
let memTable = new MemTable(document.getElementById('mem-table'), document.getElementById('mem-table--style'));
let pointer = document.getElementById('pointer');
let instructionPointer = document.getElementById('ip');
let bfInterpreter = new BFInterpreter();

let codeInput = document.getElementById('code');
let code = [];
let clockSpeed = document.getElementById('clock-speed');

let run = document.getElementById('run');
let pause = document.getElementById('pause');
let step = document.getElementById('step');
/** @type {HTMLButtonElement} */
let reset = document.getElementById('reset');

let isProgrammRunning = false;

cl.onRead = s => bfInterpreter.writeToSTDIn(s);

bfInterpreter.onSTDOut = s => cl.writeToSTDOut(s);
bfInterpreter.onMemChange = (p,v) => {
    memTable.setValue(p,v, isProgrammRunning);
};

run.addEventListener('click', () => {
    if (!isProgrammRunning) {
        try {
            bfInterpreter.parseCode(codeInput.innerText);
            codeInput.innerHTML = parseCode(codeInput.innerText);
            isProgrammRunning = true;
        } catch (e) {
            alert(e.message);
        }
    }
    reset.disabled = false;
    pause.disabled = false;
    step.disabled = true;
    run.disabled = true;
    codeInput.contentEditable = !true;
    bfInterpreter.run();
});

pause.addEventListener('click', () => {
    bfInterpreter.pause();
    reset.disabled = false;
    pause.disabled = true;
    step.disabled = false;
    run.disabled = false;
    codeInput.contentEditable = !true;
});

step.addEventListener('click', () => {
    if (!isProgrammRunning) {
        try {
            bfInterpreter.parseCode(codeInput.innerText);
            code = parseCode(codeInput.innerText);
            codeInput.innerHTML = parseCode(codeInput.innerText);
            code.map(codeInput.appendChild);
            isProgrammRunning = true;
        } catch (e) {
            alert(e.message);
        }
    }
    reset.disabled = false;
    pause.disabled = true;
    isProgrammRunning = true;
    codeInput.contentEditable = !true;
    bfInterpreter.nextStep();
});

reset.addEventListener('click', () => {
    isProgrammRunning = false;
    bfInterpreter.reset();
    memTable.updateMemoryPointer(0);
    reset.disabled = true;
    pause.disabled = true;
    step.disabled = false;
    run.disabled = false;
    codeInput.contentEditable = !false;
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
    
    memTable.updateMemoryPointer(p);
}

bfInterpreter.onInstructionPointerChange = (p) => {
    instructionPointer.innerText = p;

    document.getElementById('ip-style').innerText = 
    `#code span:nth-of-type(${p+1}) {
        background-color: rgba(255, 0, 0, 0.5);
    }`;
}

clockSpeed.addEventListener('change', () => {
    bfInterpreter.setClockSpeed(clockSpeed.value);
});

bfInterpreter.onStop = () => {
    memTable.updateMemoryPointer(0);
    isProgrammRunning = false;
    reset.disabled = true;
    pause.disabled = true;
    step.disabled = false;
    run.disabled = false;
    codeInput.contentEditable = !false;
}

bfInterpreter.onBreakpoint = () => {
    reset.disabled = false;
    pause.disabled = true;
    step.disabled = false;
    run.disabled = false;
    codeInput.contentEditable = false;
}
