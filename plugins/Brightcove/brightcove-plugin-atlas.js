videojs.registerPlugin('atlasTracking', function(options){

    function getM(t) {
        if (t && t.player) {
            return {
                'media': {
                    'name': t.player.mediainfo.name,
                    'is_fullscreen': t.player.isFullscreen(), // new
                    'src': t.player.currentSrc() || 'na',
                    'id': t.player.id() || 'na',
                    'autoplay': t.player.autoplay() || false,
                    'muted': t.player.muted() || false,
                    'type': t.player.currentType() || undefined,
                    'width': t.player.videoWidth() || undefined,
                    'height': t.player.videoHeight() || undefined,
                    'duration': t.player.duration(),
                    'current_time': Math.round(t.player.currentTime() * 10) / 10,
                    'played_percent': Math.round(t.player.currentTime() / t.player.duration() * 100),
                    'tag': t.nodeName.toLowerCase() || 'na',
                    'dataset': t.dataset
                }
            };
        }
    }

    function sendMessage(action, target) {
        window.top.postMessage({
            isAtlasEvent: true,
            action: action,
            category: 'video',
            attributes: JSON.stringify(getM(target))
        }, "*");
    }

    var heartbeat = (options && options['heartbeat']) ? options['heartbeat'] : 5;
    var meters = {};

    this.on('play', function(ev) {
        sendMessage('play', ev.target);
    });

    this.on('pause', function(ev) {
        sendMessage('pause', ev.target);
    });

    this.on('ended', function(ev) {
        sendMessage('end', ev.target);
    });

    this.on('timeupdate', function(ev) {
        var index = ev.target.tag + '-' + ev.target.id + '-' + ev.target.src;
        if (meters[index]) {
            return false;
        }
        meters[index] = setTimeout(() => {
            if (ev.target.paused !== true && ev.target.ended !== true) {
                sendMessage('playing', ev.target);
            }
            meters[index] = false;
        }, heartbeat * 1000);
    });
});
