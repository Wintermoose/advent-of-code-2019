const fs = require( "fs" );
let filename = "puzzle.txt";
const args = process.argv.slice( 2 );
if ( args.length === 1 ) {
    filename = args[0];
}

const recipes = {};

const content = fs.readFileSync( filename, { encoding: "utf8" } );
const parts = content.replace( /\r/g, "" ).split( "\n" ).filter( p => !!p );
const parseElement = text => {
    const parts = text.trim().split( " ", 2 );
    return { amount: +parts[0], chemical: parts[1] };
}
parts.forEach( row => {
    const sides = row.trim().split( "=>", 2 );
    const target = parseElement( sides[1] );
    const sources = sides[0].split( "," ).map( e => parseElement( e ) );
    recipes[target.chemical] = {
        amount: target.amount,
        sources
    }
} );

function getRequirements( chemical, required, pool ) {
    pool = pool || {};
//    console.log( `Need ${chemical} x ${required}`, pool );
    if ( chemical === "ORE" ) return required;

    const formula = recipes[chemical];
//    console.log( formula );
    const times = Math.ceil( required / formula.amount );
    const oreRequired = formula.sources.reduce( ( sum, element ) => {
        const needed = element.amount * times - ( pool[element.chemical] || 0);
        pool[element.chemical] = 0;
        return sum + getRequirements( element.chemical, needed, pool )
    }, 0 );

    let inPool = pool[chemical] || 0;
    inPool += times * formula.amount - required;
    pool[chemical] = inPool;
    return oreRequired;
}

let ore = 1000000000000;
let used = 0;
const pool = {};
let produced = 0;
let step = 0;
while ( true ) {
    if ( step++ % 10000 === 0 ) {
        console.log( used );
    }
    //console.log( pool );
    const required = getRequirements( "FUEL", 1, pool );
    if ( required <= (ore-used) ) {
        used += required;
        ++produced;
        // Finding the 0-based period doesn't work for the main puzzle. TODO: improve?
        if ( Object.values( pool ).filter( v => v !== 0 ).length === 0 ) break;
    } else {
        break;
    }
}
console.log( used, produced );
console.log( "FUEL produced: ", produced * Math.floor( ore /used ) );
