import fs from 'fs';
import path from 'path';

const root = '/mnt/data/Astrahani_work/public';
const partialDir = path.join(root, 'partials');

function read(file){
  return fs.readFileSync(file,'utf8');
}

function inlineHtml(html){
  // replace <div data-include="/partials/name.html"></div> with content of partial
  return html.replace(/<div\s+data-include="\/partials\/([^"]+?)"\s*><\/div>/g, (m, fname)=>{
    const filePath = path.join(partialDir, fname);
    if(!fs.existsSync(filePath)){
      console.warn('Missing partial', fname);
      return `<!-- MISSING partial: ${fname} -->`;
    }
    return read(filePath).trim();
  });
}

// index
const indexPath = path.join(root,'index.html');
let indexHtml = read(indexPath);
indexHtml = inlineHtml(indexHtml);
fs.writeFileSync(indexPath, indexHtml, 'utf8');

// privacy
const privacyPath = path.join(root,'privacy','index.html');
let privacyHtml = read(privacyPath);
// Insert header include after <div id="app"> if not present
if(!privacyHtml.includes('/partials/header.html')){
  // add placeholder to be inlined
  privacyHtml = privacyHtml.replace(/<div id="app">\s*/m, match => match + '    <div data-include="/partials/header.html"></div>\n');
}
privacyHtml = inlineHtml(privacyHtml);
fs.writeFileSync(privacyPath, privacyHtml, 'utf8');

console.log('Inlined partials into index.html and privacy/index.html');
