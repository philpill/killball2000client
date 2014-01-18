define(function(require){

    // require('crafty');

    var createjs = require('easel');

    var _ = require('underscore');

    var $ = require('jquery');

    var config = JSON.parse(require('text!config.js'));

    return (function () {

        var $output = $('.console ul');

        return {

            log : function (message) {

                console.log(message);
                var $log = $('<li></li>');
                $log.text(new Date().getTime() + ' ' + message);
                $output.append($log);
                $output.scrollTop($output[0].scrollHeight);
            }
        }
    }());
});
