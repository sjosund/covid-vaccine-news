const Parser = require('rss-parser');
const moment = require('moment');

const resources = [
    {source: 'NY Times', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml'},
    {source: 'NY Times', url: 'https://rss.nytimes.com/services/xml/rss/nyt/health.xml'},
    {source: 'NY Times', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml'},
    {source: 'The Guardian', url: 'https://www.theguardian.com/world/rss'},
    {source: 'The Guardian', url: 'https://www.theguardian.com/world/coronavirus-outbreak/rss'},
    {source: 'BBC News', url: 'http://feeds.bbci.co.uk/news/video_and_audio/health/rss.xml'},
    {source: 'BBC News', url: 'http://feeds.bbci.co.uk/news/health/rss.xml'},
    {source: 'BBC News', url: 'http://feeds.bbci.co.uk/news/video_and_audio/world/rss.xml'},
    {source: 'BBC News', url: 'http://feeds.bbci.co.uk/news/world/rss.xml'},
    {source: 'Daily Mail', url: 'https://www.dailymail.co.uk/news/coronavirus/index.rss'},
    {source: 'Daily Mail', url: 'https://www.dailymail.co.uk/sciencetech/coronavirus-vaccine-research/index.rss'},
    {source: 'Daily Mail', url: 'https://www.dailymail.co.uk/news/worldnews/index.rss'},
    {source: 'Daily Mail', url: 'https://www.dailymail.co.uk/health/index.rss'}
];

async function load() {
    var stories = await Promise.all(resources
        .map(resource => fetchRSS(resource.url)
            .then(res => res.items
                .filter(item => ((item.title.match(/corona/i) || item.title.match(/covid/i)) && item.title.match(/vaccin/i)))
                .map(item => ({ source: resource.source, url: item.link, title: item.title, time: Date.parse(item.isoDate) }))
            )
        )
    )

    stories = [...new Map(stories.flat().map(item => [item['url'], item])).values()] // Flatten and remove duplicates.
    stories.sort((a, b) => b.time - a.time);
    stories.map(appendToDocument);
}

function fetchRSS(url) {
    const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";
    let parser = new Parser();
    return parser.parseURL(CORS_PROXY + url)
}

function appendToDocument({ source, title, url, time }) {
    var story = document.createElement('div');
    story.setAttribute('class', 'story');

    var header = document.createElement('div');
    header.setAttribute('class', 'header');

    var datetime = document.createElement('p');
    datetime.setAttribute('class', 'time-text')
    console.log(time);
    datetime.appendChild(document.createTextNode(moment(time).format('MMM D, HH:mm')));
    header.appendChild(datetime);

    var sourceElement = document.createElement('p');
    sourceElement.setAttribute('class', 'source-text');
    sourceElement.appendChild(document.createTextNode(source));
    header.appendChild(sourceElement);

    // Create the story link
    var link = document.createElement('a');
    const text = document.createTextNode(title);
    link.appendChild(text);
    link.href = url;

    story.appendChild(header);
    story.appendChild(link);

    root.appendChild(story);
    root.appendChild(document.createElement('br'));
}

load()