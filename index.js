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

function doCaps(bigText, maxLen) {
    let lines = [];
    let outLine = [];
    
    // process each input line separately, to
    // preserve existing line splits
    bigText.split('\n').forEach((aLine, aLineInd) => {
        let affordable = maxLen; // character space still affordable
        
        if (aLineInd > 0) {
            // make the existing newlines twofold
            lines.push('');
        }
        
        aLine.split(' ').forEach((aWord) => {
            // 1 if outLine is non-empty, else 0
            // (used to account for leading spaces before all but the first word)
            let leadSpace = +(outLine.length != 0);

            // previewed new value for 'affordable'
            let newAfford = affordable - leadSpace - aWord.length;
        
            while (newAfford <= 0) {
                // this word would not fit in the current
                // line, so break it
                
                if (!outLine.length) {
                    // if affordable is still <= 0 with just
                    // this one word, then the word is nonetheless
                    // bigger than a single line; too large for
                    // soft word wrapping.
                    // (bring in the scissors!)

                    let splitInd = maxLen;
                    let hyphen = false;
                    
                    if (splitInd > 1) {
                        // if the split position is OK with it, account for
                        // a hyphen width too when splicing the word
                        splitInd -= 1;
                        hyphen = true;
                    }
                
                    // push this splice of the word (the one that fits) in    
                    outLine.push(aWord.slice(0, splitInd) + (hyphen ? '-' : ''));
                    aWord = aWord.slice(splitInd);
                }
                
                lines.push(outLine.join(' '));
                newAfford = maxLen - aWord.length;
                outLine = [];
            }
            
            outLine.push(aWord);
            affordable = newAfford;
        });

        if (outLine.length) { // the last line is non-empty
            lines.push(outLine.join(' '));
            outLine = [];
        }
    });
    
    // sanity checks
    lines.forEach((resLine) => {
        if (resLine.length > maxLen) {
            console.error(lines);
            throw new Error(`Soft wrapping algorithm failed to split line (${resLine.length} > ${maxLen}) - ` + JSON.stringify(resLine));
        }
    });
    
    return lines;
}

function* formatEntry(entry, procLineLen) {
    yield "|-----------------------------|";
    
    yield `Item #:        ${entry.index}`;
    yield `Object Class:  ${entry.class}`;
    
    yield " -";
    
    // keep in mind that HTML formatting
    // (e.g. <b>highlighted</b>) will be
    // stripped, because of how scrapeFrom
    // works.

    let text = entry.procedures.join('\n');
    
    // soft-cap each line, for extra
    // terminal goodness :D
    yield* doCaps(text, procLineLen || 100);

    yield "|-----------------------------|";
}

function printEntry(entry, procLineLen) {
    for (let value of formatEntry(entry, procLineLen)) console.log(value);
}

scrapeScp.load = scrapeFrom;
scrapeScp.format = formatEntry;
scrapeScp.print = printEntry;

