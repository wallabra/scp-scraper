const scrapeScp = require('.');


// for example,
function example() {
    let scpUrl = 'http://www.scp-wiki.net/scp-002'; // Euclid
    scrapeScp(scpUrl).catch(console.err).then((scraped) => {
        console.log(`Item #:        ${scraped.index}`);
        console.log(`Object Class:  ${scraped.class}`);
        
        console.log("|-----------------------------|");
        
        // keep in mind that HTML formatting
        // (e.g. <b>highlighted</b>) will be
        // stripped, because of how scrapeFrom
        // works.

        let text = scraped.procedures.join('\n');
        
        // soft-cap each line at 100 chars,
        // for extra terminal goodness :D
        doCaps(text, 100).forEach((l) => console.log(l));
    
        console.log("|-----------------------------|");
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

function doCapsTest(len, text) {
    // test the softcaps (use in repl)
    text = text || 'The matrix o discocombulation discocombulatrixation affixation mattress matrices spin at an all-fully-radially-lengthwise manner in a thoroughoutly manner fully consciously and super fast, with a such-disorderly fashionability approach to torque torquay!';
    doCaps(text, len).forEach((l) => console.log(l));
}

if (require.main === module) example();
