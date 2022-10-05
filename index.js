const puppeteer = require('puppeteer');
const nodeoutlook = require('nodejs-nodemailer-outlook');
var cron = require('node-cron');
const url = "https://www.amazon.com.br/PlayStation%C2%AE5-Edi%C3%A7%C3%A3o-Digital-FIFA-23/dp/B0BF5X99MC/ref=sr_1_5?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=31UYPG0X8W5ZM&keywords=ps5&qid=1664977221&qu=eyJxc2MiOiI0LjQzIiwicXNhIjoiNC4yMCIsInFzcCI6IjQuMDYifQ%3D%3D&sprefix=ps%2Caps%2C342&sr=8-5&ufe=app_do%3Aamzn1.fos.25548f35-0de7-44b3-b28e-0f56f3f96147";


//carregar o browser e retornar uma página
async function configureBrowser() {
    const browser = await puppeteer.launch({
        headless: false, //para o navegador abrir e ficar visivel
        defaultViewport: null //para abrir no tamanho da tela
    });
    const page = await browser.newPage();
    await page.goto(url);
    return page;
}

async function checkPrice(page) {
    await page.reload();
    let realPrice = await page.evaluate(() => document.querySelector(".a-price-whole").textContent); //espera a página carregar e capturar o valor do query selecionado
    let currentPrice = Number(realPrice.replace(/[^0-9.-]+/g, "").replace(".",""));
    console.log(currentPrice);

    if (currentPrice < 4100.0) {
        console.log("Compre! " + currentPrice);
        sendNotification(currentPrice);
    } else {
    console.log(currentPrice);
        
        console.log("Ainda não! " + currentPrice);
    }
}



async function startTracking() {
    const page = await configureBrowser();
    //espera a página carregar e chama a função de checagem de preço
    cron.schedule("*/10 * * * * *", function () {
        checkPrice(page);
    });
}

//envia o email com o link do produto
async function sendNotification(price) {
    let htmlText = `<a href=\"${url}\">Link</a>`;
    let textToSend = 'Price dropped to R$: ' + price;
    nodeoutlook.sendEmail({
        auth: {
            user: "email@outlook.com",
            pass: "senha"
        },
        from: 'email@outlook.com',
        to: 'destino@outlook.com',
        subject: 'Price dropped to ' + price,
        html: htmlText,
        text: textToSend,
        replyTo: 'destinoresposta@outlook.com',
       
        onError: (e) => console.log(e),
        onSuccess: (i) => console.log(i)
    }
    
    
    );


}


startTracking();


