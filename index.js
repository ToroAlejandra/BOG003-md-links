#!/usr/bin/env node

const fs = require("fs");
const { resolve } = require("path");
const path = require("path");
const mdLinkExtractor = require('markdown-link-extractor');
let MarkdownIt = require("markdown-it"),
  md = new MarkdownIt();

let result = md.parse(
  " * [Arreglos](https://curriculum.laboratoria.la/es/topic/topics/javascript/04-arrays)"
);

let filterResult;
let filterFiles;

/* filterResult = result.filter(e => e.type == 'inline');

filterResult.forEach((e) => {
  console.log(e.children[0].attrs[0][1]) // link
  // console.log(e.children[1].content);
}); */

// console.log(filterResult);

const absolutePath = (inputPath) => {
  // if path is relative this functions con>
  let resolvePath = inputPath;
  if (!path.isAbsolute(inputPath)) {
    resolvePath = path.resolve(inputPath);
  }
  return resolvePath;
};

const verifyIsDirectory = (inputPath) => {
  return new Promise((resolve, reject) => {
    fs.stat(inputPath, (err, stats) => {
      if (err){
        reject("No se puede leer directorio o archivo "+inputPath);
      } else {
        resolve(stats.isDirectory());
      }
    });
  });
};

const isMd = (inputPath) => {
  //
  if (path.extname(inputPath) === ".md") {
    return true;
  } else {
    return false;
  }
};

const readDir = (inputPath) => {
  return new Promise((resolve, reject) => {
    fs.readdir(inputPath, (err, files) => {
      if (err){
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
};

const readFile = (inputPath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(inputPath, "utf8", (err, data) => {
      if (err){
        reject("No pudo ser leido el archivo: "+ inputPath);
      } else {
        resolve(data);
      }
    });
  });
};

const findLinks = (file) => {
  return new Promise((resolve, reject) => {
    filterResult = file.filter(e => e.type == 'inline');
    resolve(filterResult);
    /* filterResult.forEach((e) => {
      if (e.children[0].attrs !== null) {
        console.log("no es nulo");
        resolve(e.children[0]);
      } else {
        reject('No ha sido posible encontrar los datos');
      }
    }); */
  });
};

// findLinks("./README1.md");

const mdLinks = (path, options) => {
  verifyIsDirectory(absolutePath(path))
  .then((res) => {
    console.log(res);
    if (res) {
      return readDir(path) //dir
    } else {
      return [path];
    }
  })
  .then((fileList) => {
    // filtar solo archivos .md
    return fileList.filter((file) => isMd(file) === true);
  })
  .then((mdFiles)=> Promise.all(mdFiles.map(mdFile => readFile(mdFile))))
  .then((contentArray) => {
    return contentArray.map((content) => {
      return mdLinkExtractor(content, true);
    });
    // extraer los links
  })
  .then((multipleArrayLinks) => {
    return multipleArrayLinks.flatMap((arrayLink) => arrayLink);
  })
  .then((arrayLink) => {

    console.log(arrayLink);
  })
  /* .then((res)=>{
    res.forEach(e => {
      
      e.children.forEach((a, i) => {
        if(a.type === 'link_open'){
          console.log(a.attrs[0][1]); //devuelve el link
          console.log();
          console.log(Object.keys(e).indexOf('type'),' : ', i);
        }
        // console.log(Object.keys(a)/* Object.keys(a).indexOf('type') );
      })
      //console.log(e.children.type);
    });
  }) */
  .then((res)=>{
    console.log("ultimo: ",(res));
  })
  .catch((err) => {
    console.log("Error: "+err);
  });
} 

mdLinks('./');
