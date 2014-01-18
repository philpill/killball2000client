define(function(require){

    var config = JSON.parse(require('text!config.js'));
    var team_fixtures = JSON.parse(require('text!fixtures/teams.js'));

    require('sinon');
    require('jquery');

    var server;

    function getTeams() {

        server = sinon.fakeServer.create();

        server.respondWith('GET', '/data/teams',
                                [200, { 'Content-Type': 'application/json' },
                                 JSON.stringify(team_fixtures.teams)]);

    }

    function respond () {

        server.respond();

        server.restore();
    }

    return {

        getTeams 	: getTeams,
        respond 	: respond
    };
});
