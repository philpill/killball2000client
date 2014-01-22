define(function(require){

    var createjs = require('easel');

    var config = require('config');

    var server = require('server');

    var Pitch = require('pitch');

    var Cursor = require('cursor');

    var utils = require('utils');

    var logger = require('logger');

    var _gameTurn;
    var _gameTurnTeam;
    var _opposingTeam;
    var _gameTurnNumber;

    function newTurn() {

        deselect.call(this);

        _gameTurnNumber++;

        _gameTurnTeam = _gameTurnNumber%2 === 0 ? this._teams[0] : this._teams[1];
        _opposingTeam = _gameTurnNumber%2 === 0 ? this._teams[1] : this._teams[0];

        deactivatePlayers(_opposingTeam.players);
        activatePlayers(_gameTurnTeam.players);

        $('.game .turn-number.value').text(_gameTurnNumber);
        $('.game .turn-team.value').text(_gameTurnTeam.name);

        this.stage.update();

        this._pitch.load(_opposingTeam.players);

        logger.log('new team turn: ' + _gameTurnTeam.name);
    }

    function activatePlayers (players) {

        var i = players.length;

        while (i--) {

            players[i].render(config.player.initialOpacity);
        }
    }

    function deactivatePlayers (players) {

        var i = players.length;

        while (i--) {

            var player = players[i];

            player.hasMoved = false;
            player.hasActioned = false;
            player.render(config.player.inactiveOpacity);
        }
    }

    function isPlayerActive(player) {

        var isPlayerActive = false;

        var players = _gameTurnTeam.players;

        for (var i = 0, j = players.length; i < j; i++) {

            if (players[i] === player) {

                isPlayerActive = true;

                break;
            }
        }

        return isPlayerActive;
    }

    function setPlayerInfo (player) {

        var attributes = player && player.attributes ? player.attributes : {

            name        : '-',
            position    : '-',
            move        : '-',
            strength    : '-',
            agility     : '-',
            armour      : '-'
        };

        $('span.name.value').text(attributes.name);
        $('span.position.value').text(attributes.position);
        $('span.movement.value').text(attributes.move);
        $('span.strength.value').text(attributes.strength);
        $('span.agility.value').text(attributes.agility);
        $('span.armour.value').text(attributes.armour);
    }

    function clearPlayerInfo () {

        setPlayerInfo(null);
    }

    function select(e) {

        var currentTarget = e.currentTarget;

        setPlayerInfo(currentTarget);

        if (isPlayerActive(currentTarget)) {

            if (this.selected) {

                deselect.call(this.selected, e);
            }

            this.selected = currentTarget;

            currentTarget.select(e);

            if (!this.selected.hasMoved) {

                _.each(_opposingTeam.players, function (player) {

                    player.renderTackleZone();
                });
            }
        }
    }

    function deselect() {

        clearPlayerInfo();

        this._pitch.clearTiles();

        if (this.selected) {

            this.selected.deselect.call(this.selected);
        }

        this.selected = null;
    }

    function bindEvents() {

        $('.end-turn').click(newTurn.bind(this));

        this.stage.on('stagemousemove', onStageMouseMove.bind(this));
    }

    function playerClick (e) {

        var currentTarget = e.currentTarget;

        if (this.selected && this.selected === currentTarget) {

            deselect.call(this, e);

        } else if (this.selected) {

            deselect.call(this, e);

            select.call(this, e);

        } else {

            select.call(this, e);
        }

        this.stage.update();
    }

    function getPath (playerPosition, cursorPosition) {

        var teams = this._teams;

        var occupiedTiles = utils.getGridsFromTeams(teams);

        var grid = utils.getPopulatedGrid(occupiedTiles);

        var path = utils.getMovementPath(
            grid,
            [ playerPosition.gridX, playerPosition.gridY ],
            [ cursorPosition.gridX, cursorPosition.gridY ]);

        var limit = this.selected.attributes.move + 1;

        return path.slice(1, limit).reverse();
    }

    function movementComplete () {

        createjs.Ticker.removeAllEventListeners('tick');

        this.selected.render(config.player.inactiveOpacity);

        this._pitch.clearTiles();
    }

    function playerDodge (player, position, destinationZone, target) {

        var hasDodged = server.dodge(player.attributes.agility, destinationZone);

        if (hasDodged) {

            logger.log('dodge: ' + player.attributes.name + ' success');

            player.playerMove.call(player, position);

            setTimeout((function () {

                playerMove.call(this, player, target);

            }).bind(this), config.animation.movementRate);

        } else {

            logger.log('dodge: ' + player.attributes.name + ' fail');

            movementComplete.call(this);

            player.playerProned.call(player);
        }
    }

    function movePlayer (player, path, target) {

        var position = utils.getPositionFromGrid(path[0], path[1]);

        var tackleZoneGrid = utils.getTackleZoneGrid(_gameTurnTeam, _opposingTeam);

        playerPosition = utils.getPosition(player.x, player.y);

        var currentZone = tackleZoneGrid[playerPosition.gridX][playerPosition.gridY];

        var destinationZone = tackleZoneGrid[position.gridX][position.gridY];

        if (currentZone > 0) {

            playerDodge.call(this, player, position, destinationZone, target);

        } else {

            player.playerMove.call(player, position);

            setTimeout((function () {

                playerMove.call(this, player, target);

            }).bind(this), config.animation.movementRate);
        }
    }

    function playerMove (player, target) {

        this._pitch.clearTiles();

        this.selected.hasMoved = true;

        var playerPosition = utils.getPosition(player.x, player.y);

        var targetPosition = utils.getPosition(target.x, target.y);

        var limitedPath = getPath.call(this, playerPosition, targetPosition);

        var path = limitedPath.pop();

        if (path) {

            movePlayer.call(this, player, path, target);

        } else {

            movementComplete.call(this);
        }
    }

    function pitchClick (e) {

        if (this.selected && this.selected.hasMoved) {

            deselect.call(this, e);
        }

        if (this.selected && !this.selected.hasMoved) {

            playerMove.call(this, this.selected, { x: e.stageX, y: e.stageY });
        }
    }

    function playerMouseOver (e) {

        console.log('game.playerMouseOver()');
    }

    function playerZoneRender (e) {

        this._pitch.renderTackleZone(e.data);
    }

    function getPitch () {

        Pitch.prototype = new createjs.Container();

        this._pitch = new Pitch();

        this._pitch.on('click', pitchClick.bind(this));

        return this._pitch;
    }

    function getCursor () {

        Cursor.prototype = new createjs.Shape();

        this._cursor = new Cursor();

        return this._cursor;
    }

    function loadTeams (teams) {

        this._teams = teams;
        _gameTurnNumber = 0;
        _gameTurnTeam = this._teams[0];

        for (var i = 0, j = this._teams.length; i < j; i++) {

            var team = this._teams[i];

            for (var k = 0, l = team.players.length; k < l; k++) {

                var player = team.players[k];

                player.on('player:click', playerClick.bind(this));

                //player.on('player:mouseover', playerMouseOver.bind(this));

                player.on('player:zone:render', playerZoneRender.bind(this));

                this.addChild(player);
            }
        }
    }

    function load() {

        this.stage = this.getStage();

        this.addChild(getPitch.call(this));

        this.addChild(getCursor.call(this));

        $.when(server.getGame())
        .then(getGameSuccess.bind(this));
    }

    function getGameSuccess (data) {

        loadTeams.call(this, [data.home, data.away]);

        this.stage.update();

        this.stage.enableMouseOver();

        newTurn.call(this);
    }

    function onStageMouseMove (e) {

        var position = utils.getPosition(e.stageX, e.stageY);

        this._cursor.x = position.snapX;
        this._cursor.y = position.snapY;

        if (this.selected && !this.selected.hasMoved) {

            this._pitch.renderMovementPath(
                { x: this.selected.x, y: this.selected.y },
                { x: position.snapX, y: position.snapY },
                this.selected.attributes.move
            );
        }

        this.stage.update();
    }

    function init () {

        load.call(this);

        bindEvents.call(this);
    }

    function Game() {

        this.init = init;
    }

    return Game;
});
