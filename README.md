# _'SCPScraper, Inc.'_

**Description:** This is a small example that illustrates the
simplicity of obtaining and scraping data from the Web using
Node.js. It is, unsurprisingly, even easier when using libraries.
This example only uses `request` for downloading the HTML data from
the website, and `cheerio` jQuery to parse this data.

**Example Procedure:**

```js
> const scraper = require('scp-scrape');
> let entry; scraper('http://www.scp-wiki.net/scp-002').then((res) => { entry = res; console.log('done'); });
Promise { <pending> }
done
> scraper.print(entry)
|-----------------------------|
Item #:        SCP-002
Object Class:  Euclid
 -
SCP-002 is to remain connected to a suitable power supply at all times, to keep it in what appears
to be a recharging mode. In case of electrical outage, the emergency barrier between the object and
the facility is to be closed and the immediate area evacuated. Once facility power is
re-established, alternating bursts of X-ray and ultraviolet light must strobe the area until
SCP-002 is re-affixed to the power supply and returned to recharging mode. Containment area is to
be kept at negative air pressure at all times.

  [...]

|-----------------------------|
```
