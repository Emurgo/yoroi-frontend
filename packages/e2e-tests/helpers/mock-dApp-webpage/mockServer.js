import jsonServerPkg from 'json-server';
const { create, bodyParser, defaults } = jsonServerPkg;

export const mockedServerPorts = 21000;
export const mockDAppUrl = `http://localhost:${mockedServerPorts}/mock-dapp`;

export const getMockServer = settings => {
  const middlewares = [...defaults({ logger: !!settings.outputLog }), bodyParser];

  const server = create();
  console.log(`JSON Server Created`);

  server.use(middlewares);

  server.get('/mock-dapp', (req, res) => {
    res.header('content-type', 'text/html');
    res.send(`
             <!doctype html>
             <html lang="en">
               <head>
                 <title>MockDApp</title>
               </head>
               <body>
               </body>
             </html>
             `);
  });

  return new Promise((resolve, reject) => {
    const mockServer = server.listen(mockedServerPorts, () => {
      console.log(`JSON Server is running at http://localhost:${mockedServerPorts}`);
      resolve(mockServer);
    });

    mockServer.on('error', (err) => {
      reject(err);
    });
  });
};