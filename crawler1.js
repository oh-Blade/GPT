const fs = require('fs');
const https = require('https');
const iconv = require('iconv-lite');
const { JSDOM } = require('jsdom');

const url = 'https://marxistphilosophy.org/maozedong/mx1/';

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on('data', (data) => {
        chunks.push(data);
      });
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const decodedHtml = iconv.decode(buffer, 'gb2312');
        resolve(decodedHtml);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

function saveContent(content, filename) {
  fs.writeFileSync(filename, content, 'utf8');
}

(async () => {
  const html = await fetchPage(url+'index.html');
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  const title = document.querySelector('title').textContent;
  const folderName = `${title}`;
  fs.mkdirSync(folderName, { recursive: true });
  
  const tdElements = document.querySelectorAll('td');
  tdElements.forEach((tdElement) => {
    const href = tdElement.querySelector('a')?.href;
    if (href) {
      const tdContent = tdElement.textContent;
      const filename = `${folderName}/${tdContent}.html`;
      fetchPage(url+href)
        .then((content) => saveContent(content, filename))
        .catch((err) => console.error(err));
    }
  });
})();
