// YOUR CODE HERE:
var refreshMessagesInterval;
var objectIds = [];
var roomnames = {};
var friends = {};
var currentRoom;

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
      displayMessages(data.results);
    },
    error: function (data) {
      console.log("GET error",data);
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
        app.addRoom(message.roomname);
      }
      app.addMessage(message);
      if(emojiBot.runOnce){
        emojiBot.emojiRespond(message);
      }
    }
  }
  emojiBot.runOnce = true;
};

//emojiBot response for new messages
var emojiBot = {
  emojiRespond: function(message){
    var runOnce = false;
    var randomReply = [':)', ':D', ':X', 'D:', ':('];
    var botMessage = randomReply[ Math.floor((Math.random() * randomReply.length)) ];
    var response = {username: 'emojiBot', text: botMessage, roomname: message.roomname};
    var wasMentioned = emojiBot.mentionedIn(message);
    if( wasMentioned || Math.random() > .66 ){
      if( wasMentioned ){ response.text = "@"+message.username+" "+response.text; }
      setTimeout( function(){ app.send(response); }, 1000);
    }
  },
  runOnce: false,
  mentionedIn: function(message){
    var theText = message.text.toLowerCase();
    if( theText.match('bot') || theText.match('emoji') ){
      return true;
    }
    return false;
  }
};


var addMessage = function(message){
  var $chats = $('#chats');
  var $message = $('<p></p>').prependTo($chats);
  $message.addClass('message').text(message.text);
  $message.attr('objectId', message.objectId);

  //Select username
  $message.prepend('<span class="username">');
  var $username = $message.find('.username');
  $username.text(message.username);
  $username.on('click', function(){
    app.addFriend(message.username);
  });
  if( friends[ message.username ] ){
    $message.addClass('friend');
  }

  //Select chat roomname
  $message.prepend('<span class="roomname">');
  var $roomname = $message.find('.roomname');
  $roomname.text(message.roomname);
  if( currentRoom === message.roomname || currentRoom === "(All Messages)"){
    $message.addClass('currentRoom');
  }

  //Add time stamp
  $message.append('<span class="createdAt">');
  var $createdAt = $message.find('.createdAt');
  $createdAt.text(message.createdAt);
};

var addRoom = function(room){
  var roomDoesntExist = true;
  $('#roomSelect>option').each(function(index, checkRoom){
    if(room === $(checkRoom).val()){
      console.log(room === $(checkRoom).val(),room, '===', $(checkRoom).val())
      roomDoesntExist = false;
    }
  });
  if( roomDoesntExist ){
    $('#roomSelect').append("<option value='"+room+"'>"+room+"</option>");
  }
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
    console.log('Submit triggered.');
    app.handleSubmit();
  });

  //Select room
  $("#roomSelect").on('change',function(something){
    currentRoom = $("#roomSelect").val();
    console.log("Changed room to: " + currentRoom);
    $('.message').each(function(i, element){
      var elementRoom = $(element).find('.roomname').text();
      if(elementRoom === currentRoom || currentRoom === "(All Messages)"){
        $(element).addClass('currentRoom');
      } else {
        $(element).removeClass('currentRoom');
      }
    });
  });
  $("#roomSelect").trigger("change");
};

var handleSubmit = function(){
  console.log("Submit handled.");
  var text = $('input').val();

  //Adding new room via form submit
  if($('#roomSelect').val() === "(Add New Room)"){
    app.addRoom(text);
    $('#roomSelect').val(text);
    $('input').val('');
    currentRoom = text;
  } else {
    //Else submit new messsage
    var username = window.location.search.split('=')[1];
    var roomname = $('#roomSelect').val() || "was null";
    var message = {username: username, text: text, roomname: roomname}
    console.log(message);
    app.send(message);
  }

};

var pause = function(){
  clearInterval(refreshMessagesInterval);
};

var addFriend = function(username){
  friends[username] = username;
  var messages = $('.message');
  for( var i = 0; i < messages.length; i++ ){
    var $message = $(messages[i]);
    if( $message.find('.username').text() === username ){
      $message.addClass('friend');
    }
  }
  console.log('Added',username,'as friend.');
};

var app = {
  init: init,
  send: post,
  server: "https://api.parse.com/1/classes/chatterbox",
  fetch: get,
  clearMessages: function(){$('#chats').children().remove();},
  addMessage: addMessage,
  addRoom: addRoom,
  addFriend: addFriend,
  handleSubmit: handleSubmit,
  emojiBot: emojiBot
};
