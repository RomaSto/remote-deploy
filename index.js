const { exec } = require('child_process');
const simpleGit = require('simple-git')('../');
const http = require('http');
const qs = require('querystring');
const process = require('process');

const port = 3001;

let branches;
simpleGit.branch(null, (error, b) => { branches = b.all; });

const requestHandler = (request, response) => {
	response.writeHead(200, { 'Content-Type': 'text/html' });

	if (request.method === 'POST') {
		let body = '';

		request.on('data', (data) => {
			body += data;


			// Too much POST data, kill the connection!
			// 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
			if (body.length > 1e6) request.connection.destroy();
		});

		request.on('end', () => {
			const selectedBranch = qs.parse(body);
			console.log(selectedBranch);
			process.chdir('../');
			exec('pwd', (err, stdout, stderr) => {
				if (err) {
					// some err occurred
					console.error(err);
				}
				else {
					// the *entire* stdout and stderr (buffered)
					console.log(`stdout: ${stdout}`);
					console.log(`stderr: ${stderr}`);
					response.end('Success');
				}
			});
		});
	}
	else {
		response.end(

			`
            <body></body>
            <form method="post" action="/">
            <select name='branch'>
            ${branches.map((branch) => {
		return `<option value="${branch}">${branch}</option>`;
	})}
            </select>
            <input type="submit" value="Submit">
            </form>
            </body>
            `
		);
	}
};

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
	if (err) {
		return console.log('something bad happened', err);
	}

	console.log(`server is listening on ${port}`);
});
