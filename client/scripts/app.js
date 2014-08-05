// YOUR CODE HERE:
var refreshMessagesInterval;
var messages;
var objectIds = [];
var roomnames = {};
$(document).ready(function(){
  app.init();
});

var post = function(message){
  $.ajax({
    url: app.server,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent',data);
      $('input').val('');
      app.fetch();
    },
    error: function (data) {
      // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message',data);
    }
  });
};

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
  // .username
  // .text
  // .roomname
  // .createdAt
  // .updatedAd
  // .objectID
  // 1. when fetching messages, if id not in array, addMessage
  // 2. append all new object ids to array
  for( var i = messages.length-1; i >=0; i-- ){
    var message = messages[i];
    if( objectIds.indexOf( message.objectId ) === -1 ){
      objectIds.push( message.objectId );
      if( !roomnames[ message.roomname ] && typeof message.roomname !== 'undefined' && message.roomname !== "" ){
        roomnames[ message.roomname ] = message.roomname;
        $('#roomSelect').append("<option value='"+message.roomname+"'>"+message.roomname+"</option>)");
      }
      app.addMessage(message);
    }
  }
};

var addMessage = function(message){
  var $chats = $('#chats');
  var $message = $('<p></p>').prependTo($chats);
  $message.addClass('message').text(message.text);
  $message.attr('objectId', message.objectId);
  $message.prepend('<span class="username">');
  var $username = $message.find('.username');
  $username.text(message.username);
  $username.on('click', function(){
    app.addFriend(message.username);
  });
  $message.prepend('<span class="roomname">');
  var $roomname = $message.find('.roomname');
  $roomname.text(message.roomname);
  $message.append('<span class="createdAt">');
  var $createdAt = $message.find('.createdAt');
  $createdAt.text(message.createdAt);
};

var addRoom = function(room){
  $('#roomSelect').append('<div class="room"></div>');
};

var init = function(){
  console.log("init called");
  // Get messages immediately, and every second thereafter.
  app.fetch();
  refreshMessagesInterval = setInterval(app.fetch, 1000);

  // Listen for submit button activity.
  $('.submit').on('click', function(){
    $('.submit').trigger("submit");
  });
  $('.submit').on('submit', function(){
    // debugger;
    console.log('Submit triggered.');
    app.handleSubmit();
  });
};

var handleSubmit = function(){
  console.log("Submit handled.");
  var text = $('input').val();
  var username = window.location.search.split('=')[1];
  var roomname = $('#roomSelect').val() || "was null";
  var message = {username: username, text: text, roomname: roomname}
  console.log(message);
  app.send(message);
};

var pause = function(){
  clearInterval(refreshMessagesInterval);
}

var app = {
  init: init,
  send: post,
  server: "https://api.parse.com/1/classes/chatterbox",
  fetch: get,
  clearMessages: function(){$('#chats').children().remove();},
  addMessage: addMessage,
  addRoom: addRoom,
  addFriend: function(username){console.log('Added',username,'as friend.');},
  handleSubmit: handleSubmit
};
