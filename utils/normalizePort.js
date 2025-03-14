/**
 * To make sure if the port is in the right format.
 * @param val The input can be anything.
 * @return The port that is in the right format.
 */
function normalizePort(val) {
	var port = parseInt(val, 10);
	if (isNaN(port)) {
	  return val;
	}
 
	if (port >= 0) {
	  return port;
	}
 
	return false;
 }
 
 export default normalizePort;
 