module.exports = class Cpu{

    constructor( code ) {
        this.memory = code
            .split( "," )
            .map( val => val.trim() )
            .map( val => +val );
        this.ip = 0;
        this.mods = 0;
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

    run( rl, onDone ) {
        const doStep = () => {
            const op = this.fetchCode();
            const instruction = op % 100;
            this.mods = (op - instruction) / 100;
            switch ( instruction ) {
                case 1: //add
                    {
                        const val = this.readMemory() + this.readMemory();
                        this.writeMemory( val );
                    }
                    doStep();
                    break;
                case 2: //mul
                    {
                        const val = this.readMemory() * this.readMemory();
                        this.writeMemory( val );
                    }
                    doStep();
                    break;
                case 3: //input
                    rl.question( "INPUT >", answer => {
                        const val = +answer;
                        this.writeMemory( val );
                        doStep();
                    } );
                    break;
                case 4:  //output
                    console.log( this.readMemory() );
                    doStep();
                    break;
                case 5: // jump-if-true
                    {
                        const val = this.readMemory();
                        const target = this.readMemory();
                        if ( val ) this.ip = target;
                        doStep();
                    }
                    break;
                case 6: // jump-if-false
                    {
                        const val = this.readMemory();
                        const target = this.readMemory();
                        if ( !val ) this.ip = target;
                        doStep();
                    }
                    break;
                case 7: // less-than
                    {
                        const val = this.readMemory() < this.readMemory();
                        this.writeMemory( val ? 1 : 0 );
                        doStep();
                    }
                    break;
                case 8: // equals
                    {
                        const val = this.readMemory() === this.readMemory();
                        this.writeMemory( val ? 1 : 0 );
                        doStep();
                    }
                    break;
                case 99: //end
                    onDone();
                    break;
                default:
                    console.error( `Unknown opcode ${op} at position ${this.ip - 1}` );
                    console.log( cpu.memory );
                    onDone();
                    break;
            }
        }

        doStep();
    }
}