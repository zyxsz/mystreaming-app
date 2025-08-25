

const chromium = require('@sparticuz/chromium');
const puppeteer = require("puppeteer-core");
const handlebars = require("handlebars");
const fs = require('fs')
const path = require('path')
const axios = require('axios')

const bannerUrl = 'https://image.tmdb.org/t/p/w500/fRYwdeNjMqC30EhofPx5PlDpdun.jpg'
const posterUrl = 'https://image.tmdb.org/t/p/w500/5lQdo9hbM8ykBdjc8XKaeZTV93U.jpg'
const logoUrl = 'https://image.tmdb.org/t/p/w500/jWzCnGEVWHUnMQ8ZIqs1LRcNjtu.png'

const bannerTemplate = handlebars.compile(fs.readFileSync(path.join(__dirname, 'templates', 'banner.handlebars')).toString('utf8'))
const posterTemplate = handlebars.compile(fs.readFileSync(path.join(__dirname, 'templates', 'poster.handlebars')).toString('utf8'))

// async function test() {
//   const width = 512
//   const height = width / (2 / 3);

//   const logoWidthSize = 0.54 * height;
//   const logoHeightSize = 0.4 * width;

//   const result = posterTemplate({
//     width, height, logoWidth: logoWidthSize, logoHeight: logoHeightSize, posterUrl, logoUrl
//   })

//   console.log(result)

// }

// test()

exports.handler = async (
  event
) => {
  const batchItemFailures = [];

  const browser = await puppeteer.launch({
    args: puppeteer.defaultArgs({ args: chromium.args, headless: "shell" }),
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: "shell",
    ignoreHTTPSErrors: true,
  });


  for (const message of event.Records) {
    try {
      await processMessageAsync(message, browser)
    } catch (error) {
      batchItemFailures.push({ itemIdentifier: message.messageId });
    }
  }

  await browser.close();

  return { batchItemFailures };
};

async function processMessageAsync(message, browser) {
  try {
    console.log(`Processed message ${message.body}`,);

    const data = JSON.parse(message.body)

    console.log(data)

    const width = data.width
    const height = data.height

    const logoWidthSize = (data?.type ? data.type === 'BANNER' : true) ? 0.4 * width : 0.54 * height;
    const logoHeightSize = (data?.type ? data.type === 'BANNER' : true) ? 0.3 * height : 0.4 * width;

    const html = (data?.type ? data.type === 'BANNER' : true) ? bannerTemplate({
      width, height, logoWidth: logoWidthSize, logoHeight: logoHeightSize, bannerUrl: data.bannerUrl, logoUrl: data.logoUrl || undefined
    }) : posterTemplate({
      width, height, logoWidth: logoWidthSize, logoHeight: logoHeightSize, posterUrl: data.posterUrl, logoUrl: data.logoUrl || undefined
    })

    console.log(width, height, logoWidthSize, logoHeightSize)

    const page = await browser.newPage();
    await page.setViewport({
      width,
      height,
      deviceScaleFactor: 1,
    })

    await page.setContent(html, {
      waitUntil: 'load'
    })

    const screenshot = await page.screenshot();

    await page.close()


    console.log('=-======================================', screenshot)


    console.log(`Fetching to: ${data.callbackUrl.replaceAll('localhost', '172.17.0.1')}`)
    let _ = Date.now()

    await axios.post(data.callbackUrl.replaceAll('localhost', '172.17.0.1'), { token: data.token }).then(() => {
      console.log(`Request done in ${Date.now() - _}ms`)
    })

    _ = Date.now()

    await axios.put(data.uploadUrl, screenshot).then(() => {
      console.log(`Upload done in ${Date.now() - _}ms`)
    })
  } catch (err) {
    console.error("An error occurred", err, err?.response);
    throw err;
  }
}

