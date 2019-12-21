module.exports = class Cpu{

    constructor( code ) {
        this.memory = code
            .split( "," )
            .map( val => val.trim() )
            .map( val => BigInt(val) );
        this.ip = 0n;
        this.mods = 0n;
        this.done = false;
        this.base = 0n;

        this.inputFn = () => console.error( "Input not implemented" );
        this.outputFn = val => console.log( val );
        this.onDone = () => { };
    }

    fetchCode() {
        return this.memory[this.ip++] || 0n;
    }

    getMod() {
        let mod = this.mods % 10n;
        this.mods = ( this.mods - mod ) / 10n;
        return mod;
    }

    readMemory() {
        const mod = this.getMod();
        const value = this.fetchCode();
        if ( mod === 0n ) {
            return this.memory[value] || 0n;
        } else if ( mod === 1n ) {
            return value;
        } else {
            return this.memory[value + this.base] || 0n;
        }
    }

    writeMemory( val ) {
        const mod = this.getMod();
        if ( mod === 0n ) {
            this.memory[this.fetchCode()] = val;
        } else if ( mod === 1n ) {
            console.error( "Incorrect address mode 1 for write at ", this.ip );
        } else {
            this.memory[this.fetchCode() + this.base] = val;
        }
    }

    configure( { inputFn, outputFn, onDone } ) {
        this.inputFn = inputFn || this.inputFn;
        this.outputFn = outputFn || this.outputFn;
        this.onDone = onDone || this.onDone;
    }

    step( onNext ) {
        if ( this.done ) return onNext(true);

        const op = this.fetchCode();
        const instruction = op % 100n;
        this.mods = (op - instruction) / 100n;
        switch ( instruction ) {
            case 1n: //add
                {                    
                    const val = this.readMemory() + this.readMemory();
                    this.writeMemory( val );
                }
                break;
            case 2n: //mul
                {
                    const val = this.readMemory() * this.readMemory();
                    this.writeMemory( val );
                }
                break;
            case 3n: //input
                this.inputFn( answer => {
                    const val = BigInt( answer );
                    this.writeMemory( val );
                    return onNext( false );
                } )
                return;
            case 4n:  //output
                this.outputFn( this.readMemory() );
                break;
            case 5n: // jump-if-true
                {
                    const val = this.readMemory();
                    const target = this.readMemory();
                    if ( val ) this.ip = target;
                }
                break;
            case 6n: // jump-if-false
                {
                    const val = this.readMemory();
                    const target = this.readMemory();
                    if ( !val ) this.ip = target;
                }
                break;
            case 7n: // less-than
                {
                    const val = this.readMemory() < this.readMemory();
                    this.writeMemory( val ? 1n : 0n );
                }
                break;
            case 8n: // equals
                {
                    const val = this.readMemory() === this.readMemory();
                    this.writeMemory( val ? 1n : 0n );
                }
                break;
            case 9n: // set-base
                {
                    const val = this.readMemory();
                    this.base += val;
                }
                break;
            case 99n: //end
                this.done = true;
                this.onDone();
                return onNext( true );
            default:
                console.error( `Unknown opcode ${op} at position ${this.ip - 1n}` );
                console.log( this.memory );
                this.done = true;
                this.onDone();
                return onNext( true );
        }
        return onNext( false );
    }

    run() {
        const doStep = done => {
            if ( !done ) Promise.resolve().then( () => this.step( doStep ) );
        }

        doStep( false );
    }
}