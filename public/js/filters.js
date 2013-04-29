myApp.filter('newlines', function() {
  return function(text) {
    return text.replace(/\n/g, '<br/>');
  }
})
myApp.filter('noHTML', function() {
  return function(text) {
    return text.replace(/&/g, '&amp;')
      .replace(/>/g, '&gt;')
      .replace(/</g, '&lt;');
  }
});


myApp.filter('getBy', function() {
  return function(field_name, input, id) {
    var i=0, len=input.length;
    for (; i<len; i++) {
      if (input[i][field_name] === id) {
        return input[i];
      }
    }
    return null;
  }
});