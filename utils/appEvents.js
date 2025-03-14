/**
 * Handle http error event.
 */
export const onError = (port) => (error) => {
	if (error.syscall !== "listen") {
		throw error;
	}

	const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case "EACCES":
			console.error(bind + " requires elevated privileges");
			process.exit(1);
			break;
		case "EADDRINUSE":
			console.error(bind + " is already in use");
			process.exit(1);
			break;
		default:
			throw error;
	}
};

/**
 * Handle http listening event.
 */
export const onListening = (server) => () => {
	const addr = server.address();
	const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr?.port;
	console.log(`🚀 App listening on ${bind}`);
};
