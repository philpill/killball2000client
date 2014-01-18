define(function(require){

    var createjs = require('easel');

    var config = JSON.parse(require('text!config.js'));
    var utils = require('utils');

    function click(e) {

        var position = utils.getPosition(e.stageX, e.stageY);

        var event = new createjs.Event('interface:mouse:click');
        event.data = position;
        this.dispatchEvent(event);
    }


    function mouseOver(e) {

        var position = utils.getPosition(e.stageX, e.stageY);

        console.log(position);

        var event = new createjs.Event('interface:mouse:move');
        event.data = position;
        this.dispatchEvent(event);
    }

    var Interface = function () {

        this.x = 0;
        this.y = 0;

        this.name = 'interface';
        
        var g = new createjs.Graphics();

        var width = config.tile.width*config.width;

        var height = config.tile.height*config.height;

        g.beginFill('rgba(0,0,0,0.1)'); 

        g.rect(0, 0, width, height); 

        this.graphics = g;
        
        this.on('click', click);

        //this.on('mouseover', mouseOver);
    }

    Interface.prototype = new createjs.Shape();

    return Interface;
});
