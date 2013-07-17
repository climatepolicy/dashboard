google.load("feeds", "1");

function feedme(address, divname,keyword, number) {   
    // Our callback function, for when a feed is loaded.
    function feedLoaded(result) {
      if (!result.error) {
        // Grab the container we will put the results into
        var container = document.getElementById(divname);
        container.innerHTML = '';
    
        // Loop through the feeds, putting the titles onto the page.
        // Check out the result object for a list of properties returned in each entry.
        // http://code.google.com/apis/ajaxfeeds/documentation/reference.html#JSON
        /*for (var i = 0; i < result.feed.entries.length; i++) {
          var entry = result.feed.entries[i];
          if (entry.title.indexOf('arbcombo') >= 0){ 
              var div = document.createElement("div");
          div.appendChild(document.createTextNode(entry.title.replace("arbcombo -- ","")));
          container.appendChild(div);}*/
         var html = '';
           for (var i = 0; i < result.feed.entries.length; i++) {
      			var entry = result.feed.entries[i];
      			if (entry.title.indexOf(keyword) >= 0){ 
      				html += '<p><a href="' + entry.link + '">' + entry.title.replace("arbcombo -- ","") + '</a></p>';
      				
      			}
   			 }
		//html += '<input type="button" onclick="feedme("https://news.google.com/news/feeds?um=1&ned=us&hl=en&q=ab32+california&output=rss", "content", "",5);" value="Feed me more"/> ';
   		container.innerHTML = html;
        
        }
		
      }
    
    
    function OnLoad() {
      // Create a feed instance that will grab the feed.
      var feed = new google.feeds.Feed(address);
      feed.setNumEntries(number);
    
      // Calling load sends the request off.  It requires a callback function.
      feed.load(feedLoaded);
    }
    
    google.setOnLoadCallback(OnLoad);
    }
    