define(function(require){
    // require('crafty');
    var createjs = require('easel');
    var _ = require('underscore');
    var $ = require('jquery');
    var logger = require('logger');
    var config = require('config');
    var utils = require('utils');
    var attributes = {
        position:   'lineman',
        move:       6,
        strength:   3,
        agility:    3,
        armour:     7
    };
    function getMoves() {
        var move = this.attr('move');
        var x = this.attr('x');
        var y = this.attr('y');
        var position = utils.getPosition(x, y);
        var left = position.gridX - move;
        var right = position.gridX + move + 1;
        var top = position.gridY - move;
        var bottom = position.gridY + move + 1;
        left = left < 0 ? 0 : left;
        right = right < config.width ? right : config.width;
        top = top < 0 ? 0 : top;
        bottom = bottom < config.height ? bottom : config.height;
        var moves = [];
        for (var i = top; i < bottom; i++) {
            for (var j = left; j < right; j++) {
                moves.push([j, i]);
            }
        }
        return moves;
    }
    //not used
    function getMovementMatrix() {
        var grid = utils.createBlankGrid();
        var moves = this.getMoves();
        for (var i = 0, j = moves.length; i < j; i++) {
            grid[moves[i][0]][moves[i][1]] = 1;
        }
        return grid;
    }
    function select(e) {
        this.render();
        this.setActive();
    }
    function deselect(e) {
        this.render();
        this.setInactive();
    }
    function playerMove(position) {
        this.x = position.snapX;
        this.y = position.snapY;
        logger.log('move: ' + this.attributes.name +
                            ' [' + position.gridX + ', ' + position.gridY + ']');
    }
    function mouseOver (e) {
        // console.log(e);
    }
    function render (alpha) {
        this._playerShape.graphics.clear();
        this._playerShape.graphics.beginFill(this.attributes.colour);
        this._playerShape.graphics.setStrokeStyle(1, 'round').beginStroke('black');
        this._playerShape.graphics.drawCircle(config.tile.width/2, config.tile.height/2, config.tile.height - config.tile.height/2 - 1);
        if (typeof alpha !== 'undefined' && typeof alpha !== null) {
            this._playerShape.filters = [
                new createjs.ColorFilter(1, 1, 1, 1, 0, 0, 0, alpha)
            ];
        }
        this._playerShape.graphics.endStroke().endFill();
        this._playerShape.cache(0, 0, config.tile.height, config.tile.width);
    }
    function setActive () {
        this._activeSquare.graphics.clear();
        this._activeSquare.graphics.setStrokeStyle(1, 'round').beginStroke('white');
        this._activeSquare.graphics.drawRect(0, 0, config.tile.width, config.tile.height);
        this._activeSquare.graphics.endStroke();
    }
    function setInactive () {
        this._activeSquare.graphics.clear();
    }
    function getZone () {
        var position = utils.getPosition(this.x, this.y);
        return this.isProne ? [] : utils.getAdjacentGridsMatrix(position.gridX, position.gridY);
    }
    function renderTackleZone () {
        var zone = this.getZone();
        var e = new createjs.Event('player:zone:render');
        e.data = zone;
        this.dispatchEvent(e);
    }
    function setPosition (gridX, gridY) {
        var position = utils.getPositionFromGrid(gridX, gridY);
        this.x = position.snapX;
        this.y = position.snapY;
    }
    function playerProned () {
        this.isProne = true;
    }
    function click () {
        this.dispatchEvent(new createjs.Event('player:click'));
    }
    function mouseOver () {
        this.dispatchEvent(new createjs.Event('player:mouseover'));
    }
    function bindEvents () {
        this.on('click', click);
        this.on('mouseover', mouseOver);
    }
    var Player = function(data, teamName, teamColour) {
        this.mouseOver          = mouseOver;
        this.select             = select;
        this.deselect           = deselect;
        this.playerMove         = playerMove;
        this.getMoves           = getMoves;
        this.getMovementMatrix  = getMovementMatrix;
        this.render             = render;
        this.setPosition        = setPosition;
        this.bindEvents         = bindEvents;
        this.renderTackleZone   = renderTackleZone;
        this.setActive          = setActive;
        this.setInactive        = setInactive;
        this.getZone            = getZone;
        this.playerProned       = playerProned;
        this.attributes = {};
        this.attributes._id = data._id;
        this.attributes.name = data.name;
        this.attributes.position = data.position;
        this.attributes.number = data.number;
        this.attributes.move = 6;
        this.attributes.strength = 3;
        this.attributes.agility = 3;
        this.attributes.armour = 7;
        this.attributes.colour = teamColour;
        this.attributes.teamName = teamName;
        this._playerShape = new createjs.Shape();
        this.addChild(this._playerShape);
        this._activeSquare = new createjs.Shape();
        this.addChild(this._activeSquare);
        this.setPosition(data.x, data.y);
        this.render(config.player.initialOpacity);
        this.bindEvents();
    }
    return Player;
});
