


















const compile = require('./dist/cjs/development').compile;

compile('test.md', `
import Box from "place"

Here’s an expression:

{
  1 + 1 /* } */
}

Which you can also put inline: {1+1}.

<>
  <Box>
    <SmallerBox>
      - Lists, which can be indented.
    </SmallerBox>
  </Box>
</>`).then(console.log);