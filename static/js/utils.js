define(function(require){
    require('jquery');
    require('astar');
    var config = require('config');
    var tile = config.tile;
    return {
        getMovementPath: function (grid, start, end) {
            var rows = config.height;
            var columns = config.width;
            var path = a_star(start, end, grid, columns, rows, true);
            var newPath = _.map(path, function (node) { return [node.x, node.y] });
            return newPath;
        },
        getAdjacentGridsMatrix: function (x, y) {
            var grids = [
                [x-1, y-1], [x, y-1], [x+1, y-1],
                [x-1, y+0], [x+1, y+0],
                [x-1, y+1], [x, y+1], [x+1, y+1]
            ];
            return grids;
        },
        getPositionFromGrid: function(gridX, gridY) {
            var preciseX = snapX = gridX * tile.width;
            var preciseY = snapY = gridY * tile.height;
            return {
                preciseX: preciseX,
                preciseY: preciseY,
                snapX: snapX,
                snapY: snapY,
                gridX: gridX,
                gridY: gridY
            }
        },
        getPosition: function(x, y) {
            var snapX = Math.floor(x / tile.width) * tile.width;
            var snapY = Math.floor(y / tile.height) * tile.height;
            var gridX = snapX/tile.width;
            var gridY = snapY/tile.height;
            return {
                preciseX: x,
                preciseY: y,
                snapX: snapX,
                snapY: snapY,
                gridX: gridX,
                gridY: gridY
            };
        },
        getGridsFromTeams: function(teams) {
            var grids = _.map(teams, function (team) {
                return this.getGridsFromTeam(team);
            }, this);
            return _.flatten(grids, true);
        },
        getGridsFromTeam: function (team) {
            var players = team.players
            var grids = _.map(players, function (player) {
                var position = this.getPosition(player.x, player.y);
                return [position.gridX, position.gridY];
            }, this);
            return grids;
        },
        getTackleZonesByTeam: function (team) {
            var players = team.players;
            var tackleZones = _.map(players, function (player) {
                var position = this.getPosition(player.x, player.y);
                return this.getAdjacentGridsMatrix(position.gridX, position.gridY);
            }, this);
            return _.flatten(tackleZones, true);
        },
        getPopulatedGrid: function (occupiedTiles) {
            var grid = this.createBlankGrid();
            for (var i = 0, j = occupiedTiles.length; i < j; i++) {
                var tile = occupiedTiles[i];
                grid[tile[0]][tile[1]] = 1;
            }
            return grid;
        },
        createBlankGrid: function () {
            var grid = [];
            for (var i = 0; i < config.width; i++) {
                grid[i] = [];
                for (var j = 0; j < config.height; j++) {
                    grid[i][j] = 0;
                }
            }
            return grid;
        },
        getTackleZoneGrid: function (gameTurnTeam, opposingTeam) {
            var grid = this.createBlankGrid();
            var tackleZones = this.getTackleZonesByTeam(opposingTeam);
            _.each(tackleZones, function (zone) {
                grid[zone[0]][zone[1]]++;
            });
            return grid;
        }
    }
});
