
const fs = require('fs');
const path = require('path');
let MarkdownIt = require('markdown-it'),
    md = new MarkdownIt();
let result = md.parse(' * [Arreglos](https://curriculum.laboratoria.la/es/topics/javascript/04-arrays)');
let verifyResult = result.slice('<a');
let filterResult;

/* filterResult = result.filter((e) => {
  if(e.type === 'inline'){
    return true;
  }else{
   return false;
  }
});*/

filterResult = result.filter(e => e.type == 'inline');

filterResult.forEach((e) => {
  console.log(e.children[0].attrs[0][1])
  // console.log(e.children[1].content);
});

console.log(filterResult);

//console.log(result.indexOf('"') + '  ' + result)

const pathsToCheck = ['./MDLINKS', './MDLINKS/BOG003-md-links/index.js'];

const absolutePath = (inputPath) => { // if path is relative this functions convert this to absolute
  let resolvePath = inputPath;
  if(!path.isAbsolute(inputPath)){
    resolvePath = path.resolve(inputPath)
  }
  return resolvePath;
};

// verify if path is directory or file
const verifyIsDirectory = (inputPath) => (fs.stat('./', (err, stats) => {
      if (err) throw err;
      // console.log(`stats: ${JSON.stringify(stats)}`);
  
      
        return (stats.isDirectory());
    })
)

console.log(verifyIsDirectory('./'));

const isMd = (inputPath) => { // 
  if (path.extname(inputPath) === '.md') {
    return true;
  }else{
    return false;
  }
};

const readFile = (inputPath) => {
  if(isMd(inputPath)){
    fs.readFile(inputPath, 'utf8', (err, data) => {
      if (err) {
        return console.error(err)
      }
      data.split('\n').forEach((e) => { 
        console.log(e);
      });
    })
  }
};

// readFile('./README.md');



/*module.exports = (path, options) => {
  console.log('Hola');
};
*/
