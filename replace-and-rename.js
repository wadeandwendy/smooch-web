var fs = require('fs');
var input = process.argv[2];
var args = process.argv.slice(3);

console.log("Replacing " + input + " with " + process.env[input]);
console.log("----------------------");

for(i=0; i<args.length; i++) {
  var origName = args[i];
  var newName = origName.replace(input, process.env[input]);

  console.log(origName + " => " + newName);
  fs.renameSync(origName, newName);
}
