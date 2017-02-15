function initialize() {
      var feed = new superfeedr.Feed("http://blog.superfeedr.com/atom.xml");
      feed.load(function(result) {
        if (!result.error) {
          console.log(result)
          var container = document.getElementById("feed");
          for (var i = 0; i < result.feed.entries.length; i++) {
            var entry = result.feed.entries[i];
            var div = document.createElement("div");
            div.appendChild(document.createTextNode(entry.title));
            container.appendChild(div);
          }
        }
      });
    }
    superfeedr.auth('superfeedr', '12dc3ce4ec0a03610030f640b06e14f2');
    superfeedr.setOnLoadCallback(initialize);
    
function feedme(address, divname,keyword, number) {
    var container = document.getElementById(divname);
        container.innerHTML = "TEAM TURKEY";
        }