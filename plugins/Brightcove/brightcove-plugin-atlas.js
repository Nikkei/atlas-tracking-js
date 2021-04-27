videojs.registerPlugin('atlasTracking', function(options){

    function getM(player) {
        if (player) {
            return {
                'media': {
                    'name': player.mediainfo.name,
                    'is_fullscreen': player.isFullscreen(),
                    'src': player.currentSrc() || 'na',
                    'id': player.id() || 'na',
                    'autoplay': player.autoplay() || false,
                    'muted': player.muted() || false,
                    'type': player.currentType() || undefined,
                    'width': player.videoWidth() || undefined,
                    'height': player.videoHeight() || undefined,
                    'duration': player.duration(),
                    'current_time': Math.round(player.currentTime() * 10) / 10,
                    'played_percent': Math.round(player.currentTime() / player.duration() * 100),
                    'tag': 'video-js',
                    'dataset': player.tagAttributes
                }
            };
        }
    }

    function atlasTrackEvent(action, event) {
        window.top.postMessage({
            isAtlasEvent: true,
            action: action,
            category: 'video',
            attributes: JSON.stringify(getM(event.target.player))
        }, "*");
    }

    var heartbeat = (options && options['heartbeat']) ? options['heartbeat'] : 5;
    var meters = {};

    this.on('play', function(event) {
        atlasTrackEvent('play', event);
    });

    this.on('pause', function(event) {
        atlasTrackEvent('pause', event);
    });

    this.on('ended', function(event) {
        atlasTrackEvent('end', event);
    });

    this.on('timeupdate', function(event) {
        var index = event.target.player.currentSrc();
        if (meters[index]) {
            return false;
        }
        meters[index] = setTimeout(() => {
            if (event.target.paused !== true && event.target.ended !== true) {
                atlasTrackEvent('playing', event);
            }
            meters[index] = false;
        }, heartbeat * 1000);
    });
});
