module.exports = class Cpu{

    constructor( code ) {
        this.memory = code
            .split( "," )
            .map( val => val.trim() )
            .map( val => +val );
        this.offset = 0;
    }

    fetchCode() {
        if ( this.offset > this.memory.length ) {
            throw new Error( "Read past memory" );
        }
        return this.memory[this.offset++];
    }

    readMemory() {
        return this.memory[this.fetchCode()];
    }

    writeMemory( val ) {
        this.memory[this.fetchCode()] = val;
    }

    run() {
        let exit = false;
        while ( !exit ) {
            const op = this.fetchCode();
            switch ( op ) {
                case 1: //add
                    {
                        const val = this.readMemory() + this.readMemory();
                        this.writeMemory( val );
                    }
                    break
                case 2: //mul
                    {
                        const val = this.readMemory() * this.readMemory();
                        this.writeMemory( val );
                    }
                    break;
                case 99: //end
                    exit = true;
                    break;
                default:
                    console.error( `Unknown opcode ${op} at position ${this.offset - 1}` );
                    console.log( this.memory );
                    exit = true;
                    break;
            }
        }
    }
}