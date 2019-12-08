module.exports = class Cpu{

    constructor( code ) {
        this.memory = code
            .split( "," )
            .map( val => val.trim() )
            .map( val => +val );
        this.ip = 0;
        this.mods = 0;
        this.done = false;

        this.inputFn = () => console.error( "Input not implemented" );
        this.outputFn = val => console.log( val );
        this.onDone = () => { };
    }

    fetchCode() {
        if ( this.ip > this.memory.length ) {
            throw new Error( "Read past memory" );
        }
        return this.memory[this.ip++];
    }

    getMod() {
        let mod = this.mods % 10;
        this.mods = ( this.mods - mod ) / 10;
        return mod;
    }

    readMemory() {
        const mod = this.getMod();
        const value = this.fetchCode();
        return mod ? value : this.memory[value];
    }

    writeMemory( val ) {
        this.memory[this.fetchCode()] = val;
    }

    configure( { inputFn, outputFn, onDone } ) {
        this.inputFn = inputFn || this.inputFn;
        this.outputFn = outputFn || this.outputFn;
        this.onDone = onDone || this.onDone;
    }

    step( onNext ) {
        if ( this.done ) return onNext(true);

        const op = this.fetchCode();
        const instruction = op % 100;
        this.mods = (op - instruction) / 100;
        switch ( instruction ) {
            case 1: //add
                {
                    const val = this.readMemory() + this.readMemory();
                    this.writeMemory( val );
                }
                return onNext( false );
            case 2: //mul
                {
                    const val = this.readMemory() * this.readMemory();
                    this.writeMemory( val );
                }
                return onNext( false );
            case 3: //input
                this.inputFn( answer => {
                    const val = +answer;
                    this.writeMemory( val );
                    return onNext( false );
                })
                break;
            case 4:  //output
                this.outputFn( this.readMemory() );
                return onNext( false );
            case 5: // jump-if-true
                {
                    const val = this.readMemory();
                    const target = this.readMemory();
                    if ( val ) this.ip = target;
                }
                return onNext( false );
            case 6: // jump-if-false
                {
                    const val = this.readMemory();
                    const target = this.readMemory();
                    if ( !val ) this.ip = target;
                }
                return onNext( false );
            case 7: // less-than
                {
                    const val = this.readMemory() < this.readMemory();
                    this.writeMemory( val ? 1 : 0 );
                }
                return onNext( false );
            case 8: // equals
                {
                    const val = this.readMemory() === this.readMemory();
                    this.writeMemory( val ? 1 : 0 );
                }
                return onNext( false );
            case 99: //end
                this.done = true;
                this.onDone();
                return onNext( true );
            default:
                console.error( `Unknown opcode ${op} at position ${this.ip - 1}` );
                console.log( cpu.memory );
                this.done = true;
                this.onDone();
                return onNext( true );
        }
    }

    run() {
        const doStep = done => {
            if ( !done ) this.step( doStep );
        }

        doStep( false );
    }
}