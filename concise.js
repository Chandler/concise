var testRecords = '[{"time":1405231438695,"text":"test la de la de la"},{"time":1405231438991,"text":"a"},{"time":1405231439092,"text":"asd"},{"time":1405231439194,"text":"asdf"},{"time":1405231440410,"text":"asd"},{"time":1405231440611,"text":"as"},{"time":1405231440686,"text":""},{"time":1405231440687,"text":""},{"time":1405231440719,"text":""},{"time":1405231440719,"text":""},{"time":1405231440741,"text":""},{"time":1405231440816,"text":""},{"time":1405231440817,"text":""},{"time":1405231440848,"text":""},{"time":1405231440917,"text":""},{"time":1405231440918,"text":""},{"time":1405231441019,"text":"t"},{"time":1405231441119,"text":"thi"},{"time":1405231441221,"text":"this"},{"time":1405231441322,"text":"this "},{"time":1405231441423,"text":"this is"},{"time":1405231441524,"text":"this is "},{"time":1405231441626,"text":"this is t"},{"time":1405231441727,"text":"this is th"},{"time":1405231441829,"text":"this is the "},{"time":1405231441929,"text":"this is the e"},{"time":1405231442032,"text":"this is the en"},{"time":1405231442132,"text":"this is the end"},{"time":1405231442233,"text":"this is the end "},{"time":1405231442336,"text":"this is the end o"},{"time":1405231442437,"text":"this is the end or"},{"time":1405231442541,"text":"this is the end or i"},{"time":1405231442639,"text":"this is the end or is"},{"time":1405231442740,"text":"this is the end or is "},{"time":1405231442941,"text":"this is the end or is i"},{"time":1405231443041,"text":"this is the end or is is"},{"time":1405231443142,"text":"this is the end or is isd"},{"time":1405231443347,"text":"this is the end or is isdas"},{"time":1405231443548,"text":"this is the end or is isdasf"},{"time":1405231444156,"text":"this is the end or is isdas"},{"time":1405231444360,"text":"this is the end or is isda"},{"time":1405231444562,"text":"this is the end or is is"},{"time":1405231444663,"text":"this is the end or is"},{"time":1405231444764,"text":"this is the end or"},{"time":1405231444865,"text":"this is the end"},{"time":1405231444967,"text":"this is the "},{"time":1405231445066,"text":"this is the"},{"time":1405231446056,"text":"this is the"}]'

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

//checks stream for newly posted tweet
var streamMutationCallback = function(){
  if($(".my-tweet .tweet-text").first().text() == records[records.length-1].text){
    var tweetID = $(".my-tweet").first().attr("data-tweet-id").toString();
    chrome.storage.sync.set({ tweetID : "test"}, function() {
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
    
    $tweetText.text(record.text)

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
  var history = JSON.parse(testRecords).reverse() //lookupHistory(permalinkTweetId);

  if(history) {
    var $tweetActions = $(".tweet-actions"); //menu el we want to add a replay button too
    var $tweetText    = $(".tweet-text"); //tdiv we want to modify the text of during the replay
    var $replayButton = $('<button class="replay"> replay this tweet!!! </button>'); //the replay button element we want to insert

    //setup event lister on the replay button
    $replayButton.click(function() { 
      replay($tweetText, history.pop(), history)
    })

    //render replay button 
    $tweetActions.append($replayButton)
  }
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
