const PORT = process.env.PORT || 5000;
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

const newspapers = [
    {
        name: 'thetimes',
        address: 'https://www.thetimes.co.uk/environment/climate-change',
        base: ''
    },
    {
        name: 'guardian',
        address: 'https://www.theguardian.com/environment/climate-crisis',
        base: ''
    },
    {
        name: 'telegraph',
        address: 'https://www.telegraph.co.uk/climate-change/',
        base: 'https://www.telegraph.co.uk'
    },
    {
        name: 'detik',
        address: 'https://www.detik.com/tag/climate-change',
        base: 'https://www.detik.com'
    },
]

const articles = [];

// get a multiple newspaper source
newspapers.forEach(newspaper => {
    axios.get(newspaper.address)
        .then(response => {
            const html = response.data;
            const $ = cheerio.load(html);
            $("a:contains('climate')", html).each(function () {
                const title = $(this).text()
                const url = $(this).attr('href')

                articles.push({
                    title,
                    url: newspaper.base + url,
                    source: newspaper.name
                })
            })
        }).catch(err => console.log(err));
})

app.get('/', (req, res) => {
    res.json('Welcome to My Climate Change News API');
})

// getting news source
app.get('/news', (req, res) => {
    res.json(articles);
})

// getting an individual new source by parameter
app.get('/news/:newspaperId', (req, res) => {
    const newspaperId = req.params.newspaperId;
    const newspaperAddress = newspapers.filter(newspaper => newspaper.name === newspaperId)[0].address;
    const newspaperBase = newspapers.filter(newspaper => newspaper.name === newspaperId)[0].base;

    // console.log(newspaperAddress);
    axios.get(newspaperAddress)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            const specificArticle = []

            $("a:contains('climate')", html).each(function () {
                const title = $(this).text();
                const url = $(this).attr('href');

                specificArticle.push({
                    title,
                    url: newspaperBase + url,
                    source: newspaperId
                })
            })
            res.json(specificArticle)
        }).catch(err => console.log(err));
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));