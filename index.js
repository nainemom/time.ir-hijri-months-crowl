const cheerio = require('cheerio')
const fetch = require('node-fetch')

function getUrlToFetch(year, month, day) {
  return `https://www.time.ir/?convertyear=${year}&convertmonth=${month}&convertday=${day}&convertlcid=1025&_=${Date.now()}`
}

function parseHtmlAndCheck(html, checkDay) {
  const $ = cheerio.load(html)
  const elemText = $('.dateConvertFirstDate .numeral').text()
  // console.log(elemText)
  if (elemText.split('/')[2].trim() === checkDay.toString()) {
    return true
  } else {
    return false
  }
}

async function monthLength(year, month) {
  let tryDay = 30
  while(true) {
    const url = getUrlToFetch(year, month, tryDay)
    // console.info(`requesting for ${year}/${month}/${tryDay}: ${url}`)
    const res = await fetch(url)
    if (!res.ok) {
      console.info(`request failed!`)
      throw new Error('')
    }
    const html = await res.text()
    // console.info(`request done! now crowling...`)
    if (parseHtmlAndCheck(html, tryDay)) {
      // console.info(`Done! it is ${tryDay}`)
      return tryDay
    } else {
      // console.info(`Done! it is not ${tryDay}, so it is ${tryDay - 1}`)
      return tryDay - 1
    }
  }
}

async function main() {
  const startYear = parseInt(process.argv[2])
  const endYear = parseInt(process.argv[3])
  console.log(`try to fetching ${startYear} to ${endYear}...`)
  let year = startYear
  const res = []
  while(year <= endYear) {
    console.log(`start fetching year ${year}`)
    const yearStartTime = Date.now()
    const currentYear = [year]
    let month = 1
    while(month <= 12) {
      const monthStartTime = Date.now()
      const length = await monthLength(year, month)
      currentYear.push(length)
      console.log(length, `month ${month} of ${year} tooks ${Date.now() - monthStartTime} milis to get!`)
      month++
    }
    res.push(currentYear)
    console.log(`year ${year} completly done in ${Date.now() - yearStartTime} milis! this is result:`)
    console.log(currentYear)
    year++
  }
  console.log('hell yeah! it\'s done!')
  console.log('')
  console.log('')
  console.log(res)
}

main()
