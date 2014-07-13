$( document ).ready(function() {
  var target = $("#tweet-box-mini-home-profile")[0];

  var config = { attributes: true, childList: true, characterData: true };

  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

  var records = [];

  var mutationCallback = function(mutations) {
    mutations.forEach(function(mutation) {
      var text = $(mutation.target).text();
      records.push({time: Date.now(), text: text});
      console.log(text);
    });
  }

  var observer = new MutationObserver(mutationCallback);

  observer.observe(target, config);

  $(".tweet-action").click(function(){
    observer.disconnect();
    debugger
    var stream = $("#stream-items-id")[0];
    var streamObserver = new MutationObserver(function(){
    	if($(".my-tweet .tweet-text").first().text() == records[records.length-1].text){
    		
        streamObserver.disconnect();
        
        var tweetID = $(".my-tweet").first().attr("data-tweet-id").toString();
        
        chrome.storage.sync.set({ tweetID: records[records.length-1]}, function() {
          console.log(tweetID + " saved");
        });
    	}
    });
    streamObserver.observe(stream, config);
  });
});
