#!/usr/bin/env node

const fs = require("fs");
const { resolve } = require("path");
const path = require("path");
const mdLinkExtractor = require('markdown-link-extractor');
let MarkdownIt = require("markdown-it"),
  md = new MarkdownIt();

const https = require('https');
const inputPath = process.argv[2];
const validate = process.argv[3];

let result = md.parse(
  " * [Arreglos](https://curriculum.laboratoria.la/es/topic/topics/javascript/04-arrays)"
);

let filterResult;

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
        resolve({content: data, path: inputPath});
      }
    });
  });
};

const findLinks = (file) => {
  return new Promise((resolve, reject) => {
    filterResult = file.filter(e => e.type == 'inline');
    resolve(filterResult);
  });
};

const requestHttp = (object) => {
  return new Promise((resolve, reject) => {
    if(object.href){
      https.get(object.href, (response) => {
        object.status = response.statusCode;
        object.ok = response.statusMessage;
        resolve(object);
      }).on('error', (e) => {
        reject('No fue posible realizar la petición a: '+ object.href);
      });
    }
  })
}

const isValidate = (validate === '--validate') ? true : false;

const mdLinks = (path, options) => {
  return new Promise((resolve, reject) => {
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
    .then((mdFiles)=> Promise.all(mdFiles.map(mdFile => (readFile(mdFile)) )))
    .then((contentArray) => {
      // console.log(contentArray);
      return contentArray.map((content) => {
        return {link: mdLinkExtractor(content.content, true), path:content.path};
      });
    })
    .then((arrayLink) => {
      return arrayLink.map((objectLinks) => {
        return objectLinks.link.map((dataLink) => {
          let objectArrayLink = {};
          objectArrayLink.href = dataLink.href;
          objectArrayLink.text = dataLink.text;
          objectArrayLink.file = objectLinks.path;
          return objectArrayLink;
        });
      });
    })
    .then((multipleArrayLinks) => {
      return multipleArrayLinks.flatMap((arrayLink) => arrayLink);
    })
    .then((httpResponse) => {
      if (options.validate) {
        const filterLink = (httpResponse.filter(link => link.href.slice(0,5) === 'https'));
        resolve(Promise.all(filterLink.map(link => (requestHttp(link))) ));
        return Promise.all(filterLink.map(link => (requestHttp(link))) );
      } else {
        resolve(httpResponse);
        return httpResponse;
      }
    })
    /* .then((res)=>{
      console.log("ultimo: ",res);
    }) */
    .catch((err) => {
      // sconsole.log("Error: "+err);
      reject("Error: ", err);
    });
  });
}

console.log('object');
module.exports = mdLinks;
