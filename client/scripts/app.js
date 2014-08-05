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
    data: {'order': '-createdAt'},
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
  console.log(messages[0]);
  // .username
  // .text
  // .roomname
  // .createdAt
  // .updatedAd
  // .objectID
  for(var i = messages.length-1; i >=0 ; i--){
    app.addMessage(messages[i]);
  }
};
var addMessage = function(message){
  var $chats = $('#chats');
  var $message = $('<p></p>').prependTo($chats);
  $message.addClass('message').text(message.text);
  $message.prepend('<span class="username">');
  var $username = $message.find('.username');
  $username.text(message.username);
  // debugger;
  $username.on('click', function(){
    console.log('clicked username.');
    app.addFriend();
  });
  $message.prepend('<span class="roomname">');
  var $roomname = $message.find('.roomname');
  $roomname.text(message.roomname);
  $message.append('<span class="createdAt">');
  var $createdAt = $message.find('.createdAt');
  $createdAt.text(message.createdAt);
}

var refreshMessages = function(){
  app.clearMessages();
  app.fetch();
};

var addRoom = function(room){
  $('#roomSelect').append('<div class="room"></div>');
};

$(document).ready(function(){
  app.init();
});

var app = {
  init: function(){ refreshMessages(); },
  send: post,
  server: "https://api.parse.com/1/classes/chatterbox",
  fetch: get,
  clearMessages: function(){$('#chats').children().remove();},
  addMessage: addMessage,
  addRoom: addRoom,
  addFriend: function(){console.log("Called addFriend!");},
  handleSubmit: function(){}
};
