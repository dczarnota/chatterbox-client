// YOUR CODE HERE:
var post = function(message){
  $.ajax({
    url: app.server,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message');
    }
  });
};

var messages;

var get = function(){
  $.ajax({
    url: app.server,
    type: 'GET',
    contentType: 'application/json',
    success: function (data) {
      console.log("GET success");
      messages = data.results;
      displayMessages(messages);
    },
    error: function (data) {
      console.log("GET error");
      messages = ['GET request failed'];
    }
  });
};

var displayMessages = function(messages){
  // .username
  // .text
  // .roomname
  // .createdAt
  // .updatedAd
  // .objectID
  var $header = $('h1');
  for(var i = 0; i < messages.length; i++){
    var message = messages[i];
    var $message = $('<p></p>').insertAfter($header);
    $message.addClass('message').text(message.text);
    console.log(message.text);
  }
};

$(document).ready(function(){
  app.init();
});

var app = {
  init: function(){},
  send: function(){},
  server: "https://api.parse.com/1/classes/chatterbox",
  fetch: get,
  clearMessages: function(){$('.message').remove();},
  addMessage: function(){},
  addRoom: function(){},
  addFriend: function(){},
  handleSubmit: function(){}
};
