import puppeteer from "puppeteer";
import cliProgress from 'cli-progress';

import {getMatchData, getMatchIdList, writeMatchData} from "./utils/index.js";

(async () => {
  let country = null
  let league = null
  let headless = false
  let path = "./src/data"

  process.argv?.slice(2)?.map(arg => {
    if (arg.includes("country="))
      country = arg.split("country=")?.[1] ?? country;
    if (arg.includes("league="))
      league = arg.split("league=")?.[1] ?? league;
    if (arg.includes("headless"))
      headless = "new";
    if (arg.includes("path="))
      path = arg.split("path=")?.[1] ?? path;
  })

  if (!country || !league) {
    console.error("ERROR: You must set country and league parameters.");
    console.error("For usage instructions, please refer to the documentation at https://github.com/gustavofariaa/FlashscoreScraping");
    return;
  }

  const browser = await puppeteer.launch({headless});

  const matchIdList = await getMatchIdList(browser, country, league)

  const progressBar = new cliProgress.SingleBar({
    format: 'Progress {bar} {percentage}% | {value}/{total}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  });
  progressBar.start(matchIdList.length, 0);

  const data = {}
  for (const matchId of matchIdList) {
    data[matchId] = await getMatchData(browser, matchId)
    writeMatchData(data, path, `${country}-${league}`)
    progressBar.increment();
  }

  progressBar.stop();

  await browser.close();
})()
