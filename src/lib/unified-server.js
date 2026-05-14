const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const clients = new Map();

const logs = [];
const addLog = (msg) => {
  const entry = `[${new Date().toISOString()}] ${msg}`;
  console.log(entry);
  logs.push(entry);
  if (logs.length > 100) logs.shift();
};

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    
    // Endpoint de depuração remota
    if (parsedUrl.pathname === '/api/debug-server') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ logs, instances: Array.from(clients.keys()) }));
      return;
    }

    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    path: '/socket.io-custom',
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const createInstance = (instanceId) => {
    if (clients.has(instanceId)) {
      const existing = clients.get(instanceId);
      io.emit('instance-status', { id: instanceId, status: existing.status });
      return;
    }

    addLog(`Iniciando criação da instância: ${instanceId}`);
    
    try {
      const executablePath = process.env.NODE_ENV === 'production' 
        ? ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome-stable', '/usr/bin/google-chrome'].find(path => require('fs').existsSync(path))
        : undefined;

      addLog(`Caminho do Chromium detectado: ${executablePath || 'Padrão Puppeteer'}`);

      const client = new Client({
        authStrategy: new LocalAuth({
          clientId: instanceId,
          dataPath: `./.wwebjs_auth/session-${instanceId}`
        }),
        puppeteer: {
          headless: true,
          executablePath: executablePath,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
          ],
        }
      });

      const instanceData = {
        client,
        status: 'connecting',
        id: instanceId
      };

      clients.set(instanceId, instanceData);
      io.emit('instance-status', { id: instanceId, status: 'connecting' });

      client.on('qr', async (qr) => {
        addLog(`QR Code recebido para ${instanceId}`);
        try {
          const qrDataURL = await QRCode.toDataURL(qr);
          io.emit('instance-qr', { id: instanceId, qr: qrDataURL });
        } catch (err) {
          addLog(`Erro ao gerar imagem do QR: ${err.message}`);
        }
      });

      client.on('ready', () => {
        addLog(`Instância ${instanceId} está PRONTA!`);
        instanceData.status = 'connected';
        io.emit('instance-status', { id: instanceId, status: 'connected' });
      });

      client.on('auth_failure', (msg) => {
        addLog(`Falha na autenticação para ${instanceId}: ${msg}`);
      });

      client.on('disconnected', (reason) => {
        addLog(`Instância ${instanceId} desconectada: ${reason}`);
        instanceData.status = 'disconnected';
        io.emit('instance-status', { id: instanceId, status: 'disconnected' });
      });

      addLog(`Chamando client.initialize() para ${instanceId}...`);
      client.initialize().catch(err => {
        addLog(`ERRO CRÍTICO no initialize de ${instanceId}: ${err.message}`);
      });
    } catch (outerErr) {
      addLog(`ERRO ao criar objeto Client: ${outerErr.message}`);
    }
  };

  io.on('connection', (socket) => {
    console.log('[Unified Server] New socket connection');

    socket.on('init-instance', (instanceId) => {
      createInstance(instanceId);
    });

    socket.on('send-message', async ({ instanceId, to, message }) => {
      const instance = clients.get(instanceId);
      if (!instance || instance.status !== 'connected') {
        socket.emit('message-sent', { success: false, error: 'Instância não conectada', to });
        return;
      }

      try {
        const chatId = to.includes('@c.us') ? to : `${to}@c.us`;
        await instance.client.sendMessage(chatId, message);
        socket.emit('message-sent', { success: true, to });
      } catch (err) {
        socket.emit('message-sent', { success: false, error: err.message, to });
      }
    });

    socket.on('delete-instance', (instanceId) => {
      const instance = clients.get(instanceId);
      if (instance) {
        instance.client.destroy();
        clients.delete(instanceId);
        io.emit('instance-deleted', instanceId);
      }
    });
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Unified Server ready on http://localhost:3000');
  });
});
