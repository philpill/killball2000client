define(function(require){

    var createjs = require('easel');

    var config = JSON.parse(require('text!config.js'));
    var utils = require('utils');
    var _ = require('underscore');

    require('astar');

    var load = function (players) {

        var grid = utils.createBlankGrid();

        _.each(players, function (player) {

            var data = player.getZone();

            _.each(data, function (tile) {

                grid[tile[0]][tile[1]] = 1;
            });
        });

        this.grid = grid;
    }

    var clearTiles = function () {

        this._tackleZones.removeAllChildren();

        this._movementPath.removeAllChildren();

        this.getStage().update();
    }

    var renderTiles = function (data) {

        for (var i = 0, j = data.length; i < j; i++) {

            var grid = data[i];

            var position = utils.getPositionFromGrid(grid[0], grid[1]);

            var tile = getTile(position.snapX, position.snapY);

            this.addChild(tile);
        }

        this.getStage().update();
    }

    var getTile = function (x, y, colour) {

        colour = colour || 'rgba(0,0,0,0.2)';

        var tile = new createjs.Shape();

        tile.x = x;

        tile.y = y;

        tile.graphics.beginFill(colour);

        tile.graphics.drawRect(0, 0, config.tile.width, config.tile.height);

        tile.graphics.endFill();

        return tile;
    }

    var renderTackleZone = function (data) {

        for (var i = 0, j = data.length; i < j; i++) {

            var grid = data[i];

            var position = utils.getPositionFromGrid(grid[0], grid[1]);

            var tile = getTile(position.snapX, position.snapY);

            this._tackleZones.addChild(tile);
        }
    }

    var getTackleZonePositions = function () {

        var positions = [];

        var zones = this._tackleZones.children;

        positions = _.map(zones, function (tile) {

            return {
                x : tile.x,
                y : tile.y
            };
        });

        return positions;
    }

    var renderMovementPath = function (player, cursor, limit) {

        this._movementPath.removeAllChildren();

        var playerPosition = utils.getPosition(player.x, player.y);

        var start = [playerPosition.gridX, playerPosition.gridY];

        var cursorPosition = utils.getPosition(cursor.x, cursor.y);

        var end = [cursorPosition.gridX, cursorPosition.gridY];

        var teams = this.getStage().getChildAt(0)._teams;

        var occupiedTiles = utils.getGridsFromTeams(teams);

        var grid = utils.getPopulatedGrid(occupiedTiles);

        var path = utils.getMovementPath(grid, start, end);

        var range = (limit < path.length) ? limit + 1: path.length;

        for (var i = 0, j = range; i < j; i++) {

            var grid = path[i];

            var position = utils.getPositionFromGrid(grid[0], grid[1]);

            var colour = this.grid[position.gridX][position.gridY] ? 'rgba(255,0,0,0.5)' : null;

            this._movementPath.addChild(getTile(position.snapX, position.snapY, colour));
        }
    }

    var Pitch = function () {

        this.clearTiles         = clearTiles;
        this.renderMovementPath = renderMovementPath;
        this.renderTackleZone   = renderTackleZone;
        this.load               = load;

        this.x = 0;
        this.y = 0;

        this.addChild(new createjs.Bitmap('/static/img/pitch.png'));

        this._tackleZones = new createjs.Container();

        this._movementPath = new createjs.Container();

        this.addChild(this._tackleZones);

        this.addChild(this._movementPath);
    }

    return Pitch;
});
