var records = [];

/**
 * Main entry point
 */
$( document ).ready(function() {

  // if a tweetbox is found, start recording
  var tweetBox = $("#tweet-box-mini-home-profile")[0];

  if(tweetBox != null) { recordTweetBox(tweetBox) }
 
  // if a permalink page tweet id is found, load the permalink page stuff
  getPermalinkId(renderPermalinkPage)
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
    var streamObserver = new MutationObserver(streamMutationCallback);
    var stream = $("#stream-items-id")[0];
    streamObserver.observe(stream, config);
  });
}

//checks & saves changes in tweet
var mutationCallback = function(mutations) {
  mutations.forEach(function(mutation) {
    var newTweet = mutation.target.innerHTML;
    if(newTweet !== "<div>Compose new Tweet...</div>" && (typeof newTweet !== 'undefined')){
      records.push({time: Date.now(), text: newTweet});
      console.log(newTweet);
    }
  });
}

var compareNodes = function(node1, node2) {
  return (node1.text().replace(/\s/g,'') == node2.text().replace(/\s/g,''))
}

//checks stream for newly posted tweet
var streamMutationCallback = function(){
  var found = $(".my-tweet .tweet-text").first()
  var expected = $(records[records.length-1].text)

  if(compareNodes(found, expected)){
    var tweetID = $(".my-tweet").first().attr("data-tweet-id").toString();
    var obj = {}
    obj[tweetID] = JSON.stringify(records)
    chrome.storage.sync.set(obj, function() {
      console.log(tweetID + " saved");
      records = [];
    });
  }
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
  chrome.storage.sync.get(id, function(data) {
    var history = JSON.parse(data[id]).reverse()
    var $tweetActions = $(".tweet-actions"); //menu el we want to add a replay button too
    var $tweetText    = $(".tweet-text"); //tdiv we want to modify the text of during the replay
    var $replayButton = $('<button class="replay"> replay this tweet!!! </button>'); //the replay button element we want to insert

    //setup event lister on the replay button
    $replayButton.click(function() { 
      replay($tweetText, history.pop(), history)
    })

    //render replay button 
    $tweetActions.append($replayButton)
  });
}


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
