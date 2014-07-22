// Expose internals
var middleware = require( '../middleware.js' ),
    env = require('../lib/environment'),
    version = require('../../package.json').version,
    FilerWebServer = require('../lib/filer-www'),
    Sync = require( '../lib/sync'),
    SyncMessage = require('../../lib/syncmessage'),
    WebSocketServer = require('ws').Server,
    websocketAuth = require('../lib/websocket-auth');

module.exports = function createRoutes( app ) {

  app.get( "/", function( req, res ) {
    res.send( "MakeDrive: https://wiki.mozilla.org/Webmaker/MakeDrive" );
  });

  function setupWWWRoutes(route, options) {
    app.get(route, middleware.authenticationHandler, function( req, res ) {
      var username = req.params.username;
      var path = '/' + req.params[0];

      var server = new FilerWebServer(username, res, options);
      server.handle(path);
    });
  }

  /**
   * Server a path as JSON (for APIs) from a user's Filer filesystem
   */
  setupWWWRoutes('/j/*', {json: true});

  /**
   * Server a path from a user's Filer filesystem
   */
  setupWWWRoutes('/p/*', null);

  app.get( "/api/sync", middleware.crossOriginHandler, middleware.authenticationHandler, function( req, res ) {
    var username = req.params.username;
    var id = req.params.sessionId;

    res.json(200, websocketAuth.generateTokenForSession(username, id));
  });

  app.get( "/healthcheck", function( req, res ) {
    res.json({
      http: "okay",
      version: version
    });
  });
};
