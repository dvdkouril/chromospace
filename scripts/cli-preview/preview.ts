import asciify from "npm:asciify-image";
// let asciify = require('asciify-image');

const options = {
  fit: "box",
  width: 50,
  height: 50,
  color: false,
};

asciify("./test2.png", options, (err, asciified) => {
  if (err) throw err;

  // Print to console
  console.log(asciified);
});
