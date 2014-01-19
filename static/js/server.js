define(function(require){

    var config = JSON.parse(require('text!config.js'));
    // var team_fixtures = JSON.parse(require('text!fixtures/teams.js'));

    var Team = require('team');
    var Player = require('player');

    require('sinon');
    require('jquery');

    var mock = require('mock');

    var successTable = [6, 6, 5, 4, 3, 2, 1];

    function _getRandom (max, min) {

        min = min || 1;

        max = max || 6;

        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function dodge (agility, modifier) {

        var hasDodged = false;

        var random = _getRandom();

        var modifier = 0 - modifier + 1;

        var result = random + modifier;

        var success = successTable[agility];

        if (result >= success) {

            hasDodged = true;

        } else {

            if (!_armourRoll()) {

                _injuryRoll();
            }
        }

        return hasDodged;
    }

    function _injuryRoll () {

        var injuryRoll = _getRandom() + _getRandom();

        if (injuryRoll < 8) {

            //STUNNED

        } else if (injuryRoll < 10) {

            //KNOCKOUT

        } else {

            //CASUALTY
        }
    }

    function _armourRoll (armourValue) {

        armourValue = armourValue || 7;

        var armourRoll = _getRandom() + _getRandom();

        return armourRoll <= armourValue;
    }

    function _generatePlayers (teamName, teamColour, data) {

        var players = [];

        for (var j = 0; j < data.length; j++) {

            Player.prototype = new createjs.Container();

            players.push(new Player(data[j], teamName, teamColour));
        }

        return players;
    }

    function _generateTeams(data) {

        var teams = [];

        for (var i = 0; i < data.length; i++) {

            var team = data[i];

            Team.prototype = new createjs.Container();

            teams.push(new Team(team.name, team.race, team.colour, team.players));
        }

        return teams
    }

    function getTeams() {

        var dfd = new $.Deferred();

        $.ajax({

            url: config.apiServer + '/api/game/teams',
            type: 'GET',
            success: function (data) {

                var teams = _generateTeams(data.teams);

                for (var i = 0; i < teams.length;i++) {

                    var team = teams[i];

                    teams[i].players = _generatePlayers(team.name, team.colour, team.players);
                }

                dfd.resolve(teams);
            },
            beforeSend: function (xhr) {

                xhr.setRequestHeader('Origin', 'http://client-killball2000.rhcloud.com');
            }
        });

        return dfd;
    }

    return {

        getTeams : getTeams,
        dodge : dodge
    };
});
