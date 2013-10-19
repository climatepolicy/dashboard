/**
 * @license 
 * jQuery Tools @VERSION Tabs- The basics of UI design.
 * 
 * NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.
 * 
 * http://flowplayer.org/tools/tabs/
 *
 * Since: November 2008
 * Date: @DATE 
 */  
(function($) {
                
        // static constructs
        $.tools = $.tools || {version: '@VERSION'};
        
        $.tools.tabs = {
                
                conf: {
                        tabs: 'a',
                        current: 'current',
                        onBeforeClick: null,
                        onClick: null, 
                        effect: 'default',
                        initialEffect: false,   // whether or not to show effect in first init of tabs
                        initialIndex: 0,                        
                        event: 'click',
                        rotate: false,
                        
      // slide effect
      slideUpSpeed: 400,
      slideDownSpeed: 400,
                        
                        // 1.2
                        history: false
                },
                
                addEffect: function(name, fn) {
                        effects[name] = fn;
                }
                
        };
        
        var effects = {
                
                // simple "toggle" effect
                'default': function(i, done) { 
                        this.getPanes().hide().eq(i).show();
                        done.call();
                }, 
                
                /*
                        configuration:
                                - fadeOutSpeed (positive value does "crossfading")
                                - fadeInSpeed
                */
                fade: function(i, done) {                
                        
                        var conf = this.getConf(),
                                 speed = conf.fadeOutSpeed,
                                 panes = this.getPanes();
                        
                        if (speed) {
                                panes.fadeOut(speed);        
                        } else {
                                panes.hide();        
                        }

                        panes.eq(i).fadeIn(conf.fadeInSpeed, done);        
                },
                
                // for basic accordions
                slide: function(i, done) {
                  var conf = this.getConf();
                  
                        this.getPanes().slideUp(conf.slideUpSpeed);
                        this.getPanes().eq(i).slideDown(conf.slideDownSpeed, done);                         
                }, 

                /**
                 * AJAX effect
                 */
                ajax: function(i, done)  {                        
                        this.getPanes().eq(0).load(this.getTabs().eq(i).attr("href"), done);        
                }                
        };           
        
        /**
         * Horizontal accordion
         * 
         * @deprecated will be replaced with a more robust implementation
        */
        
        var
          /**
          *   @type {Boolean}
          *
          *   Mutex to control horizontal animation
          *   Disables clicking of tabs while animating
          *   They mess up otherwise as currentPane gets set *after* animation is done
          */
          animating,
          /**
          *   @type {Number}
          *   
          *   Initial width of tab panes
          */
          w;
         
        $.tools.tabs.addEffect("horizontal", function(i, done) {
          if (animating) return;    // don't allow other animations
          
          var nextPane = this.getPanes().eq(i),
              currentPane = this.getCurrentPane();
              
                // store original width of a pane into memory
                w || ( w = this.getPanes().eq(0).width() );
                animating = true;
                
                nextPane.show(); // hidden by default
                
                // animate current pane's width to zero
    // animate next pane's width at the same time for smooth animation
    currentPane.animate({width: 0}, {
      step: function(now){
        nextPane.css("width", w-now);
      },
      complete: function(){
        $(this).hide();
        done.call();
        animating = false;
     }
    });
    // Dirty hack...  onLoad, currentPant will be empty and nextPane will be the first pane
    // If this is the case, manually run callback since the animation never occured, and reset animating
    if (!currentPane.length){ 
      done.call(); 
      animating = false;
    }
        });        

        
        function Tabs(root, paneSelector, conf) {
                
                var self = this,
        trigger = root.add(this),
        tabs = root.find(conf.tabs),
        panes = paneSelector.jquery ? paneSelector : root.children(paneSelector),
        current;
                         
                
                // make sure tabs and panes are found
                if (!tabs.length)  { tabs = root.children(); }
                if (!panes.length) { panes = root.parent().find(paneSelector); }
                if (!panes.length) { panes = $(paneSelector); }
                
                
                // public methods
                $.extend(this, {                                
                        click: function(i, e) {
                          
                                var tab = tabs.eq(i),
                                    firstRender = !root.data('tabs');
                                
                                if (typeof i == 'string' && i.replace("#", "")) {
                                        tab = tabs.filter("[href*=\"" + i.replace("#", "") + "\"]");
                                        i = Math.max(tabs.index(tab), 0);
                                }
                                                                
                                if (conf.rotate) {
                                        var last = tabs.length -1; 
                                        if (i < 0) { return self.click(last, e); }
                                        if (i > last) { return self.click(0, e); }                                                
                                }
                                
                                if (!tab.length) {
                                        if (current >= 0) { return self; }
                                        i = conf.initialIndex;
                                        tab = tabs.eq(i);
                                }                                
                                
                                // current tab is being clicked
                                if (i === current) { return self; }
                                
                                // possibility to cancel click action                                
                                e = e || $.Event();
                                e.type = "onBeforeClick";
                                trigger.trigger(e, [i]);                                
                                if (e.isDefaultPrevented()) { return; }
                                
        // if firstRender, only run effect if initialEffect is set, otherwise default
                                var effect = firstRender ? conf.initialEffect && conf.effect || 'default' : conf.effect;

                                // call the effect
                                effects[effect].call(self, i, function() {
                                        current = i;
                                        // onClick callback
                                        e.type = "onClick";
                                        trigger.trigger(e, [i]);
                                });                        
                                
                                // default behaviour
                                tabs.removeClass(conf.current);        
                                tab.addClass(conf.current);                                
                                
                                return self;
                        },
                        
                        getConf: function() {
                                return conf;        
                        },

                        getTabs: function() {
                                return tabs;        
                        },
                        
                        getPanes: function() {
                                return panes;        
                        },
                        
                        getCurrentPane: function() {
                                return panes.eq(current);        
                        },
                        
                        getCurrentTab: function() {
                                return tabs.eq(current);        
                        },
                        
                        getIndex: function() {
                                return current;        
                        }, 
                        
                        next: function() {
                                return self.click(current + 1);
                        },
                        
                        prev: function() {
                                return self.click(current - 1);        
                        },
                        
                        destroy: function() {
                                tabs.off(conf.event).removeClass(conf.current);
                                panes.find("a[href^=\"#\"]").off("click.T"); 
                                return self;
                        }
                
                });

                // callbacks        
                $.each("onBeforeClick,onClick".split(","), function(i, name) {
                                
                        // configuration
                        if ($.isFunction(conf[name])) {
                                $(self).on(name, conf[name]); 
                        }

                        // API
                        self[name] = function(fn) {
                                if (fn) { $(self).on(name, fn); }
                                return self;        
                        };
                });
        
                
                if (conf.history && $.fn.history) {
                        $.tools.history.init(tabs);
                        conf.event = 'history';
                }        
                
                // setup click actions for each tab
                tabs.each(function(i) {                                 
                        $(this).on(conf.event, function(e) {
                                self.click(i, e);
                                return e.preventDefault();
                        });                        
                });
                
                // cross tab anchor link
                panes.find("a[href^=\"#\"]").on("click.T", function(e) {
                        self.click($(this).attr("href"), e);                
                }); 
                
                // open initial tab
                if (location.hash && conf.tabs == "a" && root.find("[href=\"" +location.hash+ "\"]").length) {
                        self.click(location.hash);

                } else {
                        if (conf.initialIndex === 0 || conf.initialIndex > 0) {
                                self.click(conf.initialIndex);
                        }
                }                                
                
        }
        
        
        // jQuery plugin implementation
        $.fn.tabs = function(paneSelector, conf) {
                
                // return existing instance
                var el = this.data("tabs");
                if (el) { 
                        el.destroy();        
                        this.removeData("tabs");
                }

                if ($.isFunction(conf)) {
                        conf = {onBeforeClick: conf};
                }
                
                // setup conf
                conf = $.extend({}, $.tools.tabs.conf, conf);                
                
                
                this.each(function() {                                
                        el = new Tabs($(this), paneSelector, conf);
                        $(this).data("tabs", el); 
                });                
                
                return conf.api ? el: this;                
        };                
                
}) (jQuery); 



/**
 * @license 
 * jQuery Tools @VERSION Slideshow - Extend it.
 * 
 * NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.
 * 
 * http://flowplayer.org/tools/tabs/slideshow.html
 *
 * Since: September 2009
 * Date: @DATE 
 * 
 * 
 */
(function($) {
        
        var tool;
        
        tool = $.tools.tabs.slideshow = { 

                conf: {
                        next: '.forward',
                        prev: '.backward',
                        disabledClass: 'disabled',
                        autoplay: false,
                        autopause: true,
                        interval: 7000, 
                        clickable: true,
                        api: false
                }
        };  
        
        function Slideshow(root, conf) {
        
                var self = this,
                         fire = root.add(this),
                         tabs = root.data("tabs"),
                         timer, 
                         stopped = true;
                
                // next / prev buttons
                function find(query) {
                        var el = $(query);
                        return el.length < 2 ? el : root.parent().find(query);        
                }        
                
                var nextButton = find(conf.next).click(function() {
                        tabs.next();                
                });
                
                var prevButton = find(conf.prev).click(function() {
                        tabs.prev();                
                }); 

    /**
    *
    *   Similar fix for autoscroll animation queue problem
    */
    function next(){
      // Fixes https://github.com/jquerytools/jquerytools/issues/885
      if (timer) clearTimeout(timer); // reset timeout, especially for angry clicks
      timer = setTimeout(function(){
        tabs.next();
      }, conf.interval);
    }

                // extend the Tabs API with slideshow methods                        
                $.extend(self, {
                                
                        // return tabs API
                        getTabs: function() {
                                return tabs;        
                        },
                        
                        getConf: function() {
                                return conf;        
                        },
                                
                        play: function() {
        
                                // do not start additional timer if already exists
                                if (timer) { return self; }        
                                
                                // onBeforePlay
                                var e = $.Event("onBeforePlay");
                                fire.trigger(e);                                
                                if (e.isDefaultPrevented()) { return self; }                                
                                
                                stopped = false;                                
                                
                                // onPlay
                                fire.trigger("onPlay");                                
                                
                                fire.on('onClick', next);
                                next();
                                
                                return self;
                        },
                
                        pause: function() {
                                
                                if (!timer) { return self; }

                                // onBeforePause
                                var e = $.Event("onBeforePause");
                                fire.trigger(e);                                        
                                if (e.isDefaultPrevented()) { return self; }                
                                
                                timer = clearTimeout(timer);
                                
                                // onPause
                                fire.trigger("onPause");        
                                
                                fire.off('onClick', next);
                                
                                return self;
                        },
                        
                        // resume playing if not stopped
                        resume: function() {
                                stopped || self.play();
                        },
                        
                        // when stopped - mouseover won't restart 
                        stop: function() {                                        
                                self.pause();
                                stopped = true;        
                        }
                        
                });

                // callbacks        
                $.each("onBeforePlay,onPlay,onBeforePause,onPause".split(","), function(i, name) {
                                
                        // configuration
                        if ($.isFunction(conf[name]))  {
                                $(self).on(name, conf[name]);        
                        }
                        
                        // API methods                                
                        self[name] = function(fn) {
                                return $(self).on(name, fn);
                        };
                });        
                
        
                /* when mouse enters, slideshow stops */
                if (conf.autopause) {
                        tabs.getTabs().add(nextButton).add(prevButton).add(tabs.getPanes()).hover(self.pause, self.resume);
                } 
                
                if (conf.autoplay) {
                        self.play();        
                }
                
                if (conf.clickable) {
                        tabs.getPanes().click(function()  {
                                tabs.next();
                        });
                } 
                
                // manage disabling of next/prev buttons
                if (!tabs.getConf().rotate) {
                        
                        var disabled = conf.disabledClass;
                        
                        if (!tabs.getIndex()) {
                                prevButton.addClass(disabled);
                        }
                        
                        tabs.onBeforeClick(function(e, i)  { 
                                prevButton.toggleClass(disabled, !i);
                                nextButton.toggleClass(disabled, i == tabs.getTabs().length -1); 
                        });
                }  
        }
        
        // jQuery plugin implementation
        $.fn.slideshow = function(conf) {
        
                // return existing instance
                var el = this.data("slideshow");
                if (el) { return el; }
 
                conf = $.extend({}, tool.conf, conf);
                
                this.each(function() {
                        el = new Slideshow($(this), conf);
                        $(this).data("slideshow", el);                         
                });        
                
                return conf.api ? el : this;
        };
        
})(jQuery); 