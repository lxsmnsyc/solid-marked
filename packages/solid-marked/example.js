import { compile } from './dist/esm/development/compiler.mjs';

async function testCompile(code) {
  return (await compile('test.md', code)).code;
}

console.log(await testCompile(`
![This is an example][alpha]

[alpha]: bravo
`));