const { compile } = require('./dist/cjs/development');



















compile('test.md', '# Hello World').then((result) => console.log(result.code));