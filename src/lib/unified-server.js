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

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
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

    console.log(`[Unified Server] Creating instance: ${instanceId}`);
    
    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: instanceId,
        dataPath: `./.wwebjs_auth/session-${instanceId}`
      }),
      puppeteer: {
        headless: true,
        executablePath: process.env.NODE_ENV === 'production' ? '/usr/bin/chromium' : undefined,
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
      console.log(`[Unified Server] QR RECEIVED for ${instanceId}`);
      try {
        const qrDataURL = await QRCode.toDataURL(qr);
        io.emit('instance-qr', { id: instanceId, qr: qrDataURL });
      } catch (err) {
        console.error('QR Generation error:', err);
      }
    });

    client.on('ready', () => {
      console.log(`[Unified Server] Client ${instanceId} is ready!`);
      instanceData.status = 'connected';
      io.emit('instance-status', { id: instanceId, status: 'connected' });
    });

    client.on('disconnected', (reason) => {
      console.log(`[Unified Server] Client ${instanceId} disconnected`, reason);
      instanceData.status = 'disconnected';
      io.emit('instance-status', { id: instanceId, status: 'disconnected' });
    });

    client.initialize().catch(err => console.error(`[Unified Server] Init error:`, err));
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
