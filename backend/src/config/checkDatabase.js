
const db = require("./database");

const tables = db.prepare(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
    AND name NOT LIKE 'sqlite_%'
`).all();

console.log("\nFoodHub Database Tables:");

tables.forEach((table) => {
    console.log(" -", table.name);
});

console.log("\nTotal Tables:", tables.length);
