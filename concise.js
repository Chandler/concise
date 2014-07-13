$( document ).ready(function() {
  var target = $("#tweet-box-mini-home-profile")[0];

  var config = { attributes: true, childList: true, characterData: true };

  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

  var records = [];

  //checks & saves changes in tweet
  var mutationCallback = function(mutations) {
    mutations.forEach(function(mutation) {
      var text = $(mutation.target).text();
      if(text !== "Compose new Tweet..."){
        records.push({time: Date.now(), text: text});
        console.log(text);
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

  var observer = new MutationObserver(mutationCallback);
  observer.observe(target, config);

  $(".tweet-action").click(function(){
    var streamObserver = new MutationObserver(streamMutationCallback);
    var stream = $("#stream-items-id")[0];
    streamObserver.observe(stream, config);
  });
});
