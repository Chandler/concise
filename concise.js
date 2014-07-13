$( document ).ready(function() {
  var target = $("#tweet-box-mini-home-profile")[0];

  var config = { attributes: true, childList: true, characterData: true };

  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

  var records = [];

  var mutationCallback = function(mutations) {
    mutations.forEach(function(mutation) {
      var text = $(mutation.target).text()
      records.push({time: Date.now(), text: text});
      console.log(text);
    });
  }

  var observer = new MutationObserver(mutationCallback);

  observer.observe(target, config);

  $(".tweet-action").click(function(){
    observer.disconnect();
  });


  var tweet = {}
});
