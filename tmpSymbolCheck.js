const YahooFinance = require('yahoo-finance2').default;
const yf = new YahooFinance();
const symbols = ['XLK','XLF','XLE','XLV','XLY','XLC','^NSEBANK','^CNXIT','^NSECG','^NSEPHARMA','^NSEAUTO'];
(async ()=>{
  for (const s of symbols) {
    try {
      const r = await yf.quote(s);
      console.log(s, r.regularMarketChangePercent, r.regularMarketPrice, r.shortName || r.longName);
    } catch (e) {
      console.log('ERR', s, e.message);
    }
  }
})();