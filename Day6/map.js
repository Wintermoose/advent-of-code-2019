class Map {

    constructor() {
        this.objects = {};
    }

    addRelation( relation ) {
        const parts = relation.split( ")", 2 );
        const parent = parts[0];
        const child = parts[1];
        if ( this.objects[child] ) {
            console.error( `Object ${child} already orbits ${this.objects[child]}; ${relation} doesn't fit` );
            return;
        }
        this.objects[child] = parent;
    }

    getCRC() {
        let connects = 0;
        Object.keys( this.objects ).forEach( child => {
            while ( child !== "COM" ) {
                ++connects;
                child = this.objects[child];
            }
        } );
        return connects;
    }

    getTransfers( from, to ) {
        // construct path from TO to COM
        const path = {};
        let distance = 0;
        let current = to;
        while ( current !== "COM" ) {
            path[current] = distance;
            distance += 1;
            current = this.objects[current];
        }

        // now search from FROM until we intersect
        distance = 0;
        current = from;
        while ( !path[current] ) {
            distance += 1;
            current = this.objects[current];
        }

        return distance + path[current] - 2;
    }
}

module.exports = Map;