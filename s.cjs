const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const app = express();
const port = 3000;

let browser;
let page;
const screenshotPath = __dirname + '/example.png';

async function takeScreenshot() {
    try {
        await page.screenshot({ path: screenshotPath });
    } catch (error) {
        console.error('Screenshot error:', error);
    }
}

async function initialize() {
    try {
        browser = await puppeteer.launch();
        console.log("Browser started")
        page = await browser.newPage();
        console.log("Page opened")
        await page.goto('https://thedaddy.to/embed/stream-321.php');
        console.log("Navigated to stream site")

        setInterval(takeScreenshot, 800);
        console.log("Started taking screenshots!")
    } catch (error) {
        console.error('Initialization failed:', error);
        process.exit(1);
    }
}

app.get('/screenshot', async (req, res) => {
    try {
        //console.log(`Screenshot requested from ${req.ip} at ${new Date().toISOString()}`);

        if (!fs.existsSync(screenshotPath)) {
            return res.status(404).send('Screenshot not yet available');
        }

        res.sendFile(screenshotPath);
    } catch (error) {
        console.error('Screenshot serving error:', error);
        res.status(500).send('<h1>Error 500</h1> <hr> <p>An issue occured while taking screenshot!</p> <code>' + error.message + '</code>' +
            '<hr> <p><em> This error also appears if puppeteer hasnt started up yet so uhhh wait a bit and refresh to see if it fixes itself lol</em></p>'
        );
    }
});

process.on('SIGINT', async () => {
    console.log('Shutting down...');
    if (browser) {
        await browser.close();
    }
    if (fs.existsSync(screenshotPath)) {
        fs.unlinkSync(screenshotPath);
    }
    process.exit(0);
});



// Handle graceful shutdown

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    initialize();
});
