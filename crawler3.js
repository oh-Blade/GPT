const fs = require('fs');
const { execSync } = require('child_process');
const { JSDOM } = require('jsdom');
const https = require('https');
const iconv = require('iconv-lite');

const baseURL = 'https://marxistphilosophy.org/maozedong/mx1/';

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

function saveMarkdown(filename, content) {
  fs.writeFileSync(filename, `${content}`, 'utf8');
}

function convertToEPUB(inputFile, outputFile) {
  try {
    execSync(`pandoc ${inputFile} -o ${outputFile}`);
    console.log(`Converted to EPUB: ${outputFile}`);
  } catch (error) {
    console.error(`Failed to convert to EPUB: ${inputFile}`);
    // throw error;
  }
}

const promise = [];

async function crawlAndSavePages() {
  const indexURL = baseURL + 'index.html';
  const html = await fetchPage(indexURL);
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const title = document.querySelector('title').textContent;
  const folderName = `${title}`;

  console.log('foldername: ' + folderName);
  // Create a folder with the extracted title as the name
  fs.mkdirSync(folderName, { recursive: true });

  let combinedMarkdown = '';

  const tdElements = document.querySelectorAll('td');
  const fo =  tdElements.forEach(async (tdElement) => {
    const href = tdElement.querySelector('a')?.href;
    if (href) {
      const tdContent = tdElement.textContent;
      
      const r = fetchPage(baseURL + href)
        .then((result) => {

          // Extract title
          const titleMatch = result.match(/<TITLE>(.*?)<\/TITLE>/i);
          const titleson = titleMatch ? titleMatch[1].match(/[\u4e00-\u9fa5]+/g) : 'Untitled';

          // Extract content
          const contentMatch = result.match(/<TD class="tt2"[^>]*>([\s\S]*?)<\/TD>/i);
          const content = contentMatch ? contentMatch[1] : '';

          // Save as Markdown
          const filename = `${folderName}/${titleson}.md`;

          saveMarkdown(filename, content);
          console.log(filename);

        })
        .catch((err) => console.error(err));

        promise.push(r);
    }
  });

  await Promise.all(promise);

}

crawlAndSavePages().catch((error) => {
  console.error('An error occurred:', error);
});
