const opnames = {    
    1: "ADD",
    2: "MUL",
    3: "INPUT",
    4: "OUTPUT",
    5: "IF-TRUE",
    6: "IF-FALSE",
    7: "IS-LESS-THEN",
    8: "IS-EQUAL",
    9: "BASE",
    99: "END"
}

function decode( memory, ip ) {
    function fetchCode() {
        return memory[ip++] || 0n;
    }

    function getMod() {
        let mod = mods % 10n;
        mods = mods / 10n;
        return mod;
    }

    function decodeParam() {
        const mod = getMod();
        const value = fetchCode();
        if ( mod === 0n ) {
            return `[${value}]`;
        } else if ( mod === 1n ) {
            return `${value}`;
        } else {
            if ( value < 0n ) {
                return `[BASE - ${-value}]`;
            } else {
                return `[BASE + ${value}]`;
            }
        }
    }

    const originalIp = ip;
    const op = fetchCode();
    const instruction = op % 100n;
    let mods = op / 100n;

    let result = opnames[instruction];
    if ( result === undefined ) {
        return {
            text: `UNKNOWN ${op}`,
            length: 1
        };
    }
    result += " ";

    switch ( instruction ) {
        case 1n: //add
        case 2n: //mul
        case 7n: // less-than
        case 8n: // equals
            {
                const p1 = decodeParam();
                const p2 = decodeParam();
                const p3 = decodeParam();
                result += `${p3} <- ${p1}, ${p2}`;
            }
            break;
        case 3n: //input
            {
                const p1 = decodeParam();
                result += `${p1} <-`;
            }
            break;
        case 4n:  //output
            {
                const p1 = decodeParam();
                result += p1;
            }
            break;
        case 5n: // jump-if-true
        case 6n: // jump-if-false
            {
                const p1 = decodeParam();
                const p2 = decodeParam();
                result += `${p1} JUMP TO ${p2}`;
            }
            break;
        case 9n: // set-base
            {
                const p1 = decodeParam();
                if ( p1[0] === "-" ) {
                    result += "+= -" + p1.substring( 1 );
                } else {
                    result += `+= ${p1}`;
                }
            }
            break;
        case 99n: //end
            break;
        default:
            break;
    }

    return {
        text: result,
        length: ip - originalIp
    }
}

module.exports = decode;