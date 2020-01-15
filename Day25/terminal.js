class Terminal {
    constructor() {
        this.lines = [""];
        this.x = 0;
        this.y = 0;
        this.inputs = [];
        this.getInput = ( lines, cb ) => cb( [] );
        this.onLine = ( text ) => { };
    }

    store( val ) {
        val = Number(val);
        if ( val === 10 ) {
            console.log( this.lines[this.lines.length - 1] );
            this.lines.push( "" );
        } else {
            this.lines[this.lines.length - 1] += String.fromCharCode( val );
        }
    }

    read( cb ) {
        if ( this.inputs.length === 0 ) {
            const oldLines = this.lines;
            this.lines = [""];
            this.getInput( oldLines, inputs => {
                this.inputs = inputs;
                if ( inputs.length === 0 ) {
                    cb( 0 );
                } else { 
                    this.read( cb );
                }
            });
        } else {
            const next = this.inputs.shift();
            cb( next.charCodeAt(0) );
        }
    }

    setGetInputs( fn ) {
        this.getInput = fn;
    }
}

module.exports = Terminal;