require.config({
    baseUrl: '/static/js',
    paths: {
        'easel'     : 'external/easeljs-0.7.1.min',
        'crafty'    : 'external/crafty',
        'sinon'     : 'external/sinon-1.7.3',
        'jquery'    : 'external/jquery-2.0.3.min',
        'text'      : 'external/text',
        'underscore': 'external/underscore-1.5.2.min',
        'astar'     : 'external/astar',
        'boostrap'  : 'external/bootstrap.min',
        'less'      : 'external/less'
    },
    shim: {
        'easel'         : { exports : 'createjs' },
        'crafty'        : { exports : 'Crafty' },
        'sinon'         : { exports : 'sinon' },
        'underscore'    : { exports : '_' },
        'astar'         : { exports : 'astar' },
        'boostrap'      : { deps    : ['jquery'] },
        'sinon'         : { exports : 'sinon' }
    },
    deps: ['game', 'easel', 'less'],
    callback: function(Game) {

        console.log('squig hopper');

        var stage = new createjs.Stage("Stage");

        Game.prototype = new createjs.Container();

        var game = new Game();

        stage.addChild(game);

        game.init();
    }
});
