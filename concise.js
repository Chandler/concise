var records = [];

/**
 * Main entry point
 */
$( document ).ready(function() {

  // if a tweetbox is found, start recording
  var tweetBox = $("#tweet-box-mini-home-profile")[0];
  var user = $(".js-mini-current-user").attr("data-screen-name");
  var userID = $(".js-mini-current-user").attr("data-user-id");

  if(tweetBox != null) { recordTweetBox(tweetBox) }
 
  // if a permalink page tweet id is found, load the permalink page stuff
  getPermalinkId(renderPermalinkPage);

  var fb = new Firebase("https://shining-fire-5019.firebaseio.com/");
  var userBase = fb.child("users");
  
  userBase.child(user).update({
    user_id: userID
  });
});

/**
 * Does the recording stuff
 */
var recordTweetBox = function(tweetBox){
  var config = { attributes: true, childList: true, characterData: true };

  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

  var observer = new MutationObserver(mutationCallback);
  observer.observe(tweetBox, config);

  $(".tweet-action").click(function(){
    var fb = new Firebase("https://shining-fire-5019.firebaseio.com/");
    var user = $(".js-mini-current-user").attr("data-screen-name");
    var tweetBase = fb.child("tweets");

    var tweetGet = $.get("http://concise-server.azurewebsites.net/tweet/latest?id="+ user + "&count=1", function( data ){
      debugger
      console.log("data loaded");
      var found = data[0].text;
      var expected = records[records.length-1].text;
      if(found.replace(/\s/g,'') == expected.replace(/\s/g,'')){  // if the tweet we get back is same as tweet we posted, minus whitespace
        var tweetID = data[0].id_str;
        var tweetHistory = JSON.stringify(records);
        tweetBase.child(tweetID).set({
            tweet_history: tweetHistory,
            text: found,
            user: data[0].user.screen_name,
            time: data[0].created_at
          });
      }
    });
  });
}

//checks & saves changes in tweet
var mutationCallback = function(mutations) {
  mutations.forEach(function(mutation) {
    var newTweet = mutation.target.innerText;
    if((newTweet.indexOf("Compose new Tweet") == -1) && (typeof newTweet !== 'undefined')){
      records.push({time: Date.now(), text: newTweet});
      console.log(newTweet);
    }
  });
}

var compareNodes = function(node1, node2) {
  return (node1.text().replace(/\s/g,'') == node2.text().replace(/\s/g,''))
}

/**
 * Loop over all records, updating the tweet text with
 * each record.text
 *  
 * Using a recursive setTimeout let's us modify the timeout 
 * duration every iteration. In this case, betweet each text 
 * update we want to wait for the real amount of time between
 * the current record and the next record.
 * @param tweetTextEl the html element to update
 * @param record the current record to update the tweet with
 * @remaining the remaining array of records to process
 */
var replay = function($tweetText, record, remaining) {
  if(remaining.length > 0) {
    var nextRecord = remaining.pop()
    var sleepTime  = nextRecord.time - record.time 

    $tweetText.html(record.text)

    setTimeout(
      function() { replay($tweetText, nextRecord, remaining) },
      sleepTime
    )
  }
}

/**
 * If tweet history can be found for the tweet id
 * then render the replay button
 */
var renderPermalinkPage = function(id) {
  
  var tweetActions = $(".tweet-actions"); //menu el we want to add a replay button too
  var tweetText    = $(".tweet-text"); //tdiv we want to modify the text of during the replay
  var replayButton = $('<button class="replay"> Replay this tweet </button>'); //the replay button element we want to insert

  //render replay button 
  tweetActions.append(replayButton);


  var postsRef = new Firebase("https://shining-fire-5019.firebaseio.com/tweets/"+id);
  postsRef.on('value', function (snapshot) {
    debugger
    tweetActions.append(replayButton);
    console.log(snapshot.val());
    //setup event lister on the replay button
    replayButton.click(function() {
      debugger
      var history = JSON.parse(snapshot.val().tweet_history).reverse();
      replay(tweetText, history.pop(), history);
    })
  }, function (errorObject) {
    console.log('The read failed: ' + errorObject.code);
  });
}
  // chrome.storage.sync.get(id, function(data) {
  //   var $tweetActions = $(".tweet-actions"); //menu el we want to add a replay button too
  //   var $tweetText    = $(".tweet-text"); //tdiv we want to modify the text of during the replay
  //   var $replayButton = $('<button class="replay"> Replay this tweet </button>'); //the replay button element we want to insert

  //   //setup event lister on the replay button
  //   $replayButton.click(function() {
  //     debugger
  //     var history = JSON.parse(data[id]).reverse();
  //     replay($tweetText, history.pop(), history);
  //   })

  //   //render replay button 
  //   $tweetActions.append($replayButton)
  // });




/**
 * returns a tweet id from a permalink page if one is found
 * otherwise returns null
 */
var getPermalinkId = function(success) {
  //["https:", "", "twitter.com", "reld_nach", "status", "488170373830033410"]
  var urlParts = document.URL.split("/")

  if(urlParts[4] == "status" && !isNaN(urlParts[5])) {
    success(urlParts[5])
  }
}
