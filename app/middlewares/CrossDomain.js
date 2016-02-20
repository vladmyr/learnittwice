/**
 * Cross Domain middleware
 * @module
 */
var CrossDomain = (function(){
  /**
   * Set response headers for cross domain request
   * @param {Object} req request
   * @param {Object} res response
   */
  var setResponseHeaders = function(req, res){
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    req.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    //res.header("Access-Control-Allow-Credentials", true);
    //req.header("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date");
  };

  /**
   * Check if request origin is whitelisted
   * @param   {Array<String>} allowedHosts
   * @param   {String}        origin
   * @returns {Boolean}
   */
  var isOriginAllowed = function(allowedHosts, origin){
    return Array.isArray(allowedHosts)
      ? typeof allowedHosts[origin] !== "undefined"
      : false;
  };

  return {
    setResponseHeaders: setResponseHeaders,
    isOriginAllowed: isOriginAllowed
  }
})();

module.exports = CrossDomain;