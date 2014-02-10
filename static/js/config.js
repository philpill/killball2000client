define(function() {

    // var api = "http://server-killball2000.rhcloud.com";

    var api = "http://localhost:8090";

    return {

        "apiServer" : api,
        "width"     : 26,
        "height"    : 15,
        "tile" : {

            "width"     : 20,
            "height"    : 20
        },
        "player"    : {

            "initialOpacity" : -80,
            "inactiveOpacity" : -140
        },
        "animation" : {

            "movementRate" : 250
        }
    }

});
