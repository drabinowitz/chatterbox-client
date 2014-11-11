// YOUR CODE HERE:
// app objects will be stored here
var app = {
  friends: {},
  server: 'https://api.parse.com/1/classes/chatterbox',
  lastCall: (new Date()).toISOString(),
  rooms: {
    '"lobby"': true,
    '"superLobby"': true
  },
};
// UTILITY METHODS
// String scrubber
app._scrubber = function(s) {
  if (typeof(s) === 'string') {
    var outputString = s.replace(/<script>/g, 'block');
    outputString = outputString.replace(/src=/g, 'block');
    outputString = outputString.replace(/javascript:/g, 'block');
    outputString = JSON.stringify(outputString);
  }

  return outputString;
};
// BACKEND METHODS
// initializes application
// must be called before other methods
app.init = function() {
  // init
  this.fetch();
  //setInterval(this._checkRoom.bind(this), 1000);
  setInterval(this.fetch.bind(this), 5000);
};
//SERVER REQUESTS
// post data to server
// expects to receive message as object with properties username, text, roomname
app.send = function(message) {

  $.ajax({
    // always use this url
    url: this.server,
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
// gets data from server
// expects to get data messages as objects with properties username, text, roomname
app.fetch = function(){
  var urlQuery = this.lastCall ? this.server + '?where={"createdAt":{"$gt":{"__type":"Date","iso":"' + this.lastCall + '"}}}' : this.server;
  $.ajax({
    url: urlQuery,
    type: 'GET',
    contentType: 'application/json',
    success: function(data) {

      for (var i = 0; i < data.results.length; i++){
        app.addMessage(data.results[i]);
        app.addRoom(data.results[i].roomname);
      }
      if (data.results.length > 0) {
        app.lastCall = data.results[i - 1].createdAt;
      }
      app._checkRoom();
    },
    error: function(data){
      console.error(data);
    }
  });
};
// DOM MANIPULATION METHODS
// removes messages from chats
app.clearMessages = function() {
  $('#chats').html('');
};
// appends a new message to chats
app.addMessage = function(message) {
  var username = this._scrubber(message.username);
  var text = this._scrubber(message.text);
  var roomname = this._scrubber(message.roomname);
  $('#chats').prepend('<div class="message"><p class="username">Username: ' + username + '</p><p class="messageText">Message: ' + text + '</p><p class="room">Room: ' + roomname + '</p><p class="createdAt">Date: ' + message.createdAt + '</p></div');
};
// appends a new room to roomSelect
app.addRoom = function(room) {
  room = app._scrubber(room);
  if (!app.rooms[room]) {
    app.rooms[room] = true;
    $('#roomSelect').append('<option value=\'' + room + '\'>' + room + '</option>');
  }
};
// 
app._checkRoom = function() {
  var selectRoom = $('#roomSelect').val();
  var allMessages = $('.message');
  if (selectRoom !== '"lobby"' && selectRoom !== '"superLobby"') {
    for (var i = 0; i < allMessages.length; i++) {
      var currentMessage = $(allMessages[i]);
      var room = currentMessage.find('.room').text();
      room = room.substr(6);
      if (room === selectRoom) {
        currentMessage.show();
      } else {
        currentMessage.hide();
      }
    }
  } else {
    for (var i = 0; i < allMessages.length; i++) {
      $(allMessages[i]).show();
    }
  }
};
// adds friend is utilized by other DOM manipulation methods for styling
app.addFriend = function(friend) {
  this.friends[friend] = true;
};
// method for resetting friends to null
app.addFriend.restore = function() {
  this.friends = {}; 
};
//accepts input message and submits it
app.handleSubmit = function() {
  var packagedMessage = {};
  //gets username from query string parameter
  packagedMessage.username = location.search.substr(10) || 'anonymous';
  //grabs mesage from text area
  packagedMessage.text = $('#message').val();
  //get roomname from room input field or lobby
  packagedMessage.roomname = JSON.parse($('#roomSelect').val()) || 'lobby';
  this.send(packagedMessage);
};
//resets message input fields
app.handleSubmit.restore = function() {
  $('#message').val('');
};
//accepts input room and adds it
app.handleRoom = function() {
  var packagedRoom = $('#newRoom').val();
  this.addRoom(packagedRoom);
};
// resets newRoom input field
app.handleRoom.restore = function() {
  $('#newRoom').val('');
}
// DOM RELATED EVENTS
// ensure DOM is loaded before enabling event handlers
$(document).ready(function() {
  // delegate from #man div to all elements with class username, add friend on click
  $('#main').on('click', '.username', function(e) {
    app.addFriend($(e.target).text());
  });
  // should call app.handleSubmit when a user submits a new message on the DOM
  $('.submit').on('click',function(e) {
    e.preventDefault();
    app.handleSubmit();
  });
  //should call app.handleRoom when a user submites a new room
  $('.submitRoom').on('click',function(e) {
    e.preventDefault();
    app.handleRoom();
    app.handleRoom.restore();
  });
  //
  $('#roomSelect').on('change', function() {
    app._checkRoom(false);
  });
});
app.init();