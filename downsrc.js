const fs = require('fs');
const path = require('path');
const https = require('https');

// 读取本地HTML文件
const html = fs.readFileSync('/Users/Downloads/1.html', 'utf8');

// 使用正则表达式匹配所有src属性
const srcRegex = /src=['"]([^'"]+\.(png|jpe?g|mp4|pdf))['"]/gi;
let srcMatch;

while(srcMatch = srcRegex.exec(html)) {
  console.log("sss");
  const srcUrl = srcMatch[1];
  
  // 移除域名获取目录路径
  const dirPath = extractPathFromUrl(srcUrl);
  if(dirPath == ''){
    continue;
  }
  
  // 按路径分隔符分割
  const parts = dirPath.split('/');  

  // 删除文件名
  parts.pop();

  // 构建本地保存目录
  let localDir = '/Users/Downloads';
  parts.forEach(p => {
    localDir += `/${p}`;
    if (!fs.existsSync(localDir)) {  
      fs.mkdirSync(localDir);
    }
  });

  // 下载文件并保存    
  https.get(srcUrl, response => {
    response.pipe(fs.createWriteStream(localDir +'/' +path.basename(srcUrl)));
  });  
}

function extractPathFromUrl(url) {
  // 定义一个正则表达式来匹配 HTTP 或 HTTPS 路径
  var httpRegex = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)/;

  // 使用正则表达式进行匹配
  var match = url.match(httpRegex);

  // 如果匹配成功，返回域名之后的部分
  if (match) {
      // match[0] 匹配整个 URL
      // match[2] 匹配域名部分
      return url.replace(match[0], '');
  } else {
      // 如果不是 HTTP 路径，则返回空字符串或原始字符串，根据你的需求而定
      return '';
  }
}