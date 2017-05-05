google.load("feeds", "1");

function feedme(address, divname,keyword, number) {   
    // Our callback function, for when a feed is loaded.
    function feedLoaded(result) {
      if (!result.error) {
        // Grab the container we will put the results into
        var container = document.getElementById(divname);
        container.innerHTML = '';

         var html = '';
           for (var i = 0; i < result.feed.entries.length; i++) {
      			var entry = result.feed.entries[i];
      			var date = new Date(entry.publishedDate);
      			var dispDate = date.toDateString();
      			
      			if (entry.title.indexOf(keyword) >= 0){ 
      			    if(divname == "news"){
      			       var splitTitle = entry.title.split(" - ");
      			       html += '<div class = "item"><a href="' + entry.link + '">' + splitTitle[0]  + '</a><br><span class = "subtext">' + splitTitle[1] + " " + '<br><span class = "bottom">' + dispDate + '</span></span></div>';
      			    }
                else if (divname == "cpi")
                {
                  var categories = entry.categories;
                  var key = "AB32";
                  for (var j = 0; j < categories.length; j++){
                    if (categories[j].indexOf(key) >= 0) {
                      html += '<div class = "item"><a href="' + entry.link + '">' + entry.title + '</a><br><span class = "subtext">' + " " + '</a><span class = "subtext"><br><span class = "bottom">' + dispDate + '<span></span></div>';
                    }
                  }
                }
      			    else{
      			       html += '<div class = "item"><a href="' + entry.link + '">' + entry.title.replace(keyword + " -- ","")  + '</a><span class = "subtext"><br><span class = "bottom">' + dispDate + '<span></span></div>';
      			    }
      				
      			}
   			 }
   		container.innerHTML = html;
        
        }
      }
    
    
    function OnLoad() {
      // Create a feed instance that will grab Digg's feed.
      var feed = new google.feeds.Feed(address);
      feed.setNumEntries(number);
    
      // Calling load sends the request off.  It requires a callback function.
      feed.load(feedLoaded);
    }
    
    google.setOnLoadCallback(OnLoad);
    }
    