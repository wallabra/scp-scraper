const scrapeScp = require('.');


// for example,
function example() {
    let scpUrl = 'http://www.scp-wiki.net/scp-002'; // Euclid
    scrapeScp(scpUrl).catch(console.err).then((scraped) => {
        scrapeScp.print(scraped);
    });
}

if (require.main === module) example();
