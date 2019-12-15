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

console.log( "ORE needed: ", getRequirements( "FUEL", 1 ) );
