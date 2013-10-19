$(function() {
        // setup ul.tabs to work as tabs for each div directly under div.panes
    $("table.tabs").tabs("div.panes > div");
});

$(function() {
    // setup ul.tabs to work as tabs for each div directly under div.panes
    $("table.tabs").tabs("div.update_panes > div", {
        interval: 10000,
        rotate: true
    }).slideshow();
    $("table.tabs").data("slideshow").play();
});

$(function(){
  $("#accordion").accordion({
                            header: "h2",
                            collapsible:true,
                            heightStyle: "content",
                            active:false,
  });
   $("#accordion").accordion("option", "icons", 
        { 'header': 'ui-icon-plus', 'activeHeader': 'ui-icon-minus' });
  });