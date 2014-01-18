define(function(require){

    var createjs = require('easel');

    var Team = function (name, race, colour, players) {

    	this.name = name;
    	this.race = race;
    	this.colour = colour;
    	this.players = players;
    };

    return Team;
});
