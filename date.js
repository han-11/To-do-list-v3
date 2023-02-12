// only add () after function when you are calling the function. 
// do not put () beihind of getDate when exporting it

// module exports shortcut:
// module.exports = exports = function Constructor() {
// };

exports.getDate  = function (){
    // get today's date
    // use const to the value because it will not being changed in other part
  const today = new Date();

  // format a javascript date
  const options = { 
    weekday:"long",
    day: "numeric",
    month: "long"
  };
  return today.toLocaleDateString("en-US", options);
};


