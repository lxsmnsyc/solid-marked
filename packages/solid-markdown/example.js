const { compile } = require('./dist/cjs/development');
















compile('test.md', `
<some-comp>
  Hello World
</some-comp>
`).then(console.log);