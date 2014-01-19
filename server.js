#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');

var app = express();

app.use(express.compress());
app.use(express.static(__dirname + '/static'));

app.get('/', function(req, res){

    res.render('static/index');
});

// ipaddress = process.env.OPENSHIFT_NODEJS_IP;
// port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

app.listen((process.env.OPENSHIFT_NODEJS_PORT || 8080), process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1');