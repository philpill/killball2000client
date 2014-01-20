define(function(require){

    var config = require('config');

    var Cursor = function () {

        this.name = 'cursor';
        this.x = 0;
        this.y = 0;

        this.graphics = new createjs.Graphics();
        this.graphics.beginFill('black');
        this.graphics.drawRect(0, 0, config.tile.width, config.tile.height);
        this.filters = [

            new createjs.ColorFilter(1, 1, 1, 0, 0, 0, 0, 100)
        ];
        this.graphics.endFill();

        this.cache(0, 0, config.tile.height, config.tile.width);
    }

    return Cursor;
});
