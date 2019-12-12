class Moon {

    constructor() {
        this.position = [0, 0, 0];
        this.velocity = [0, 0, 0];
    }

    parse( coords ) {
        coords = coords.trim();
        if ( coords[0] !== "<" || coords[coords.length - 1] !== ">" ) throw new Error( "Invalid format ", coords );
        coords = coords.substring( 1, coords.length - 1 );

        const inputs = coords
            .split( "," )
            .map( p => p.split( "=", 2 ) )
            .reduce( ( dict, el ) => {
                dict[el[0].trim()] = +( el[1].trim() )
                return dict;
            }, {} );
        
        this.position[0] = inputs.x;
        this.position[1] = inputs.y;
        this.position[2] = inputs.z;
    }

    updateGravity( other ) {
        for ( let i = 0; i < 3; ++i ) {
            if ( this.position[i] < other.position[i] ) {
                this.velocity[i] += 1;
                other.velocity[i] -= 1;
            } else if ( this.position[i] > other.position[i] ) {
                this.velocity[i] -= 1;
                other.velocity[i] += 1;
            }
        }
    }

    updatePosition() {
        for ( let i = 0; i < 3; ++i ) {
            this.position[i] += this.velocity[i];
        }
    }

    print() {
        console.log( `pos= <x= ${this.position[0]}, y= ${this.position[1]}, z= ${this.position[2]}>, vel=<x= ${this.velocity[0]}, y= ${this.velocity[1]}, z= ${this.velocity[2]}>` );
    }

    getState() {
        return this.position.join( "," ) + ";" + this.velocity.join( "," );
    }

    getPot() {
        return this.position.reduce( ( sum, pos ) => sum + Math.abs( pos ), 0 );
    }

    getKit() {
        return this.velocity.reduce( ( sum, pos ) => sum + Math.abs( pos ), 0 );
    }

}

module.exports = Moon;