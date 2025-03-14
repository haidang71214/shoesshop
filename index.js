import express from "express";
const { json, NextFunction, Request, Response, urlencoded } = express;

import dotenv from "dotenv";
import logger from "morgan";
import { createServer } from "http";
import { connect } from "mongoose";
import cors from "cors";

import normalizePort from "./utils/normalizePort.js";
import { onError, onListening } from "./utils/appEvents.js";
import rootRouter from "./routers/root.router.js";
import { engine } from "express-handlebars";

dotenv.config();

let __max = 0; // Biến max length cho log
if (process.env.DEVMODE) {
	(function () {
		const originalLog = console.log;
		function span(str) {
			if ((str?.length || 0) > __max) {
				__max = str?.length || __max;
				return "";
			}
			let res = "";
			for (let i = 0; i < __max - (str?.length || __max); i++) res += " ";
			return res;
		}

		console.log = function (...args) {
			const stack = new Error().stack?.split("\n");
			const caller = stack?.[2].match(/\((.*):(\d+):(\d+)\)/);
			if (caller) {
				const file = caller[1].split("\\").pop();
				const line = caller[2];
				const tmpLine = `\x1b[1m\x1b[34m${file}:\x1b[0m${line}`;
				const sp = span(tmpLine);
				originalLog.apply(console, [`[${tmpLine}${sp}]`, ...args]);
			} else {
				originalLog.apply(console, args);
			}
		};
	})();
}

const app = express();

// Set up Handlebars as the templating engine
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views"); // Ensure this points to your 'views' folder

// Render home view
app.get("/", (req, res) => {
	res.render("home", { title: "Welcome to My Express App" });
});

/**
 * Init mongoose.
 */
connect(process.env.MONGODB_URL)
	.then(() => {
		console.log("🚀 Connected to the server successfully!");
	})
	.catch((reason) => console.log(reason));

/**
 * Get port from .env and store in Express.
 */
const port = normalizePort(process.env.PORT || "8080");
app.set("port", port);

/**
 * Middleware setup.
 */
app.use(logger("dev"));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(
	cors({
		origin: "http://localhost:8080", //
		credentials: true, // Nếu bạn sử dụng cookie, phải có cấu hình này
		preflightContinue: true,
	})
);
app.options(
	/(.*)/,
	cors({
		origin: "*",
		methods: "*",
	})
);

/**
 * Routes setup.
 */
const apiPrefix = process.env.API_PREFIX;
console.log(apiPrefix);
app.get("/", (_req, res) => {
	res.json({ message: "Hello world!" });
});
app.use(rootRouter);

/**
 * Handle errors.
 */
app.use((err, _req, res, _next) => {
	console.error(err?.stack);
	res.status(500).json({
		message: "Internal Server Error!",
		stack: err?.message,
	});
});

/**
 * Create HTTP server.
 */
const server = createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on("error", onError(port));
server.on("listening", onListening(server));
