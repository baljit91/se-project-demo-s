/**
 * Created by Singh on 4/13/17.
 */
(function(){
    'use strict';

    function AFKMonitor(options){
        var player   = this,
            defaults = {
                containerText: 'Are you still watching?',
                messageText: 'video will be paused in',
                messageAfter :'Paused',
                containerClass: '',
                continueButtonText: 'Yes, Continue',
                continueButtonClass: '',
                stopButtonText: 'No',
                stopButtonClass: '',
                waitClass: '',
                showMessageAfter: 30000, //in ms
                pausePlayerAfter: 10000, //in ms
                continueButtonClickHandler: null,
                stopButtonClickHandler: null,
                ignoreUserActive: false //show message after certain period, regardless of if the user has interacted with player in that time
            },
            timeouts = {
                countdownTimeoutId: null,
                buttonTimeoutId: null
            },
            containerDiv,
            containerText,
            continueButton,
            stopButton,
            messageText;

        var settings = videojs.mergeOptions(defaults, options);

        var showAFKMessage = function(){
            clearVjsTimeout('countdownTimeoutId');

            if(!shouldShowContainer()){
                player.setTimeout(showAFKMessage, 10000);

                return;
            }

            showContainer();

            timeouts.buttonTimeoutId = player.setTimeout(function(){


                //$('.message-text').html("video paused");
                //document.getElementsByClassName("message-text").innerHTML = "Video Paused"
                //document.getElementsByClassName("message-text").textContent = "PP";
                player.el().appendChild(containerDiv);
                player.pause();


            }, settings.pausePlayerAfter);

            //in case the user clicks somewhere within the player other than the Continue Button to play the video,

            var counter = 8
            if(!player.paused()){


                if(!player.paused() ){

                    var interval = setInterval(function() {

                     if(!player.paused() && !$('.js-afk-container').hasClass("hidden")){
                         counter = counter - 1;
                         $('.message-text').html("video will be paused in " +counter+ " sec");
                         if(counter == 0){
                             $('.message-text').html("video paused");
                             clearInterval(interval);
                         }
                     }
                     else {

                     }

                    // Display 'counter' wherever you want to display it.


                }, 1000);

                }



            }



            player.one('play', function(){
                hideContainer();
                clearVjsTimeout('buttonTimeoutId');
            });
        };

        var shouldShowContainer = function(){
            if(settings.waitClass && player.hasClass(settings.waitClass)){
                return false;
            }
            if(player.currentTime() + (settings.pausePlayerAfter/1000) + 1 > player.duration()){
                return false;
            }
            if(player.paused()){
                return false;
            }


            return true;
        };

        var startCountdown = function(){
            if(timeouts.countdownTimeoutId){
                clearVjsTimeout('countdownTimeoutId');
            }

            timeouts.countdownTimeoutId = player.setTimeout(showAFKMessage, settings.showMessageAfter);
        };

        var clearVjsTimeout = function(key) {
            var tid = timeouts[key];
            if(tid) {
                player.clearTimeout(tid);
            }
            timeouts[key] = null;
        };

        var continueButtonClickHandler = function(e) {
            hideContainer();
            clearVjsTimeout('buttonTimeoutId');

            if(typeof settings.continueButtonClickHandler === 'function'){
                settings.continueButtonClickHandler.call(player, e);
            } else {
                if(player.paused()){
                    player.play();
                }
            }
        };

        var stopButtonClickHandler = function(e) {
            hideContainer();
            clearVjsTimeout('buttonTimeoutId');

            if(typeof settings.stopButtonClickHandler === 'function'){
                settings.stopButtonClickHandler.call(player, e);
            } else {
                //reset player to state before it started playing, bigPlayButton and Poster will be shown
                player.pause().currentTime(0).trigger('loadstart');
                player.hasStarted(false);
            }
        };

        var hideContainer = function() {
            if( !containerDiv.className.match(/\bhidden\b/) )
                containerDiv.className += ' hidden';
        };
        var showContainer = function() {
            if(!$('.js-afk-container').hasClass("hidden") && !player.paused()){
                $('.message-text').html("video will be paused in -- sec");
            }
            containerDiv.className = containerDiv.className.replace(/\bhidden\b/, '');
        };

        var init = function(){
            containerDiv = document.createElement('div');
            containerDiv.className = 'vjs-afk-container ' + settings.containerClass;
            hideContainer();

            containerText = document.createElement('h1');
            containerText.className = 'container-text';
            containerText.innerHTML = settings.containerText;

            continueButton = document.createElement('button');
            continueButton.className = 'vjs-afk-button afk-button ' + settings.continueButtonClass;
            continueButton.innerHTML = settings.continueButtonText;
            continueButton.addEventListener('click', continueButtonClickHandler);

            stopButton = document.createElement('button');
            stopButton.className = 'vjs-afk-button afk-button ' + settings.stopButtonClass;
            stopButton.innerHTML = settings.stopButtonText;
            stopButton.addEventListener('click', stopButtonClickHandler);


            messageText = document.createElement('h1');
            messageText.className = 'message-text';
            messageText.innerHTML = settings.messageText;

            containerDiv.appendChild(containerText);
            containerDiv.appendChild(continueButton);
            containerDiv.appendChild(stopButton);
            containerDiv.appendChild(messageText);
            player.el().appendChild(containerDiv);

            player.on('userinactive', function(){
                    startCountdown();
            });
            if(!settings.ignoreUserActive)
            {
                player.on('useractive', function(){
                clearVjsTimeout('countdownTimeoutId');
            });
            }

        };

        player.ready(function(){
            init();
        });
    }

    videojs.plugin('AFKMonitor', AFKMonitor);

})();
