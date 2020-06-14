const request = require('request');
const cheerio = require('cheerio')

function scrapeFrom(html) {
    // get a cheerio jQuery instance from the webpage we just downloaded
    
    let $ = cheerio.load(html); // loads the website's HTML data into cheerio
    let res = { index: null, class: null, procedures: [] };

    // scrape stuff from the page; every paragraph (<p></p>) inside SCP's
    // #page-content div will be considered
    $('#page-content > p').each((i, el) => {
        // get only this element's text contents, ignoring children
        // (also use trim to remove leading and trailing whitespaces)
        let txt = $(el).clone().children().remove().end().text().trim();
    
        if (i == 0) // Item #
            res.index = txt; // "SCP-###"
            
        else if (i == 1) // Object Class
            res.class = txt;
            
        else
            // just a regular paratgraph. we still need to
            // ignore children, because of headers like
            // "Special Containment Procedures" etc
            res.procedures.push(txt);
    });
    
    return res;
}

let scrapeScp = module.exports = function scrapeScp(url) {
    return new Promise((resolve, reject) => {
        // get our HTML data, and parse it using scrapeFrom
        request(url, {}, (err, res, body) => {
            if (err) { reject(err); }

            else resolve(scrapeFrom(body));
        })
    });
}

scrapeScp.load = scrapeFrom;

