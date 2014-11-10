// YOUR CODE HERE:
// app objects will be stored here
var app = {
  friends: {},
  server: 'https://api.parse.com/1/classes/chatterbox'
};
// initializes application
// must be called before other methods
app.init = function() {
  // init
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
  $.ajax({
    url: this.server,
    type: 'GET',
    contentType: 'application/json',
    success: function(data) {
      console.log(data);
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
  $('#chats').append('<div><p class="username">' + message.username + '</p><p>' + message.text + '</p><p>' + message.roomname + '</p></div');
};
// appends a new room to roomSelect
app.addRoom = function(room) {
  $('#roomSelect').append('<option value="' + room + '">' + room + '</option>');
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
  packagedMessage.roomname = $('#roomSelect').val() || 'lobby';
  this.send(packagedMessage);
};
//resets message input fields
app.handleSubmit.restore = function() {
  $('#message').val('');
};
// DOM RELATED EVENTS
// ensure DOM is loaded before enabling event handlers
$(document).ready(function() {
  // delegate from #man div to all elements with class username, add friend on click
  $('#main').on('click', '.username', function(e) {
    app.addFriend($(e.target).text());
  });
  // should call app.handleSubmit when a user submits a new message on the DOM
  $('.submit').on('submit',function(e) {
    app.handleSubmit();
  });
});
