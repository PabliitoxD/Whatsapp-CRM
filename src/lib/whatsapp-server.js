const { Client, LocalAuth } = require('whatsapp-web.js');
const { Server } = require('socket.io');
const http = require('http');
const QRCode = require('qrcode');

const port = 3001;
const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Map to store multiple clients
const clients = new Map();

const createInstance = (instanceId, socket) => {
  if (clients.has(instanceId)) {
    const existing = clients.get(instanceId);
    socket.emit('instance-status', { id: instanceId, status: existing.status });
    return;
  }

  console.log(`Creating instance: ${instanceId}`);
  
  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: instanceId,
      dataPath: `./.wwebjs_auth/session-${instanceId}`
    }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ],
    }
  });

  const instanceData = {
    client,
    status: 'disconnected',
    id: instanceId
  };

  clients.set(instanceId, instanceData);

  client.on('qr', async (qr) => {
    console.log(`QR RECEIVED for ${instanceId}`);
    instanceData.status = 'connecting';
    try {
      const qrDataURL = await QRCode.toDataURL(qr);
      io.emit('instance-qr', { id: instanceId, qr: qrDataURL });
    } catch (err) {
      console.error('QR Generation error:', err);
    }
  });

  client.on('ready', () => {
    console.log(`Client ${instanceId} is ready!`);
    instanceData.status = 'connected';
    io.emit('instance-status', { id: instanceId, status: 'connected' });
  });

  client.on('disconnected', (reason) => {
    console.log(`Client ${instanceId} disconnected`, reason);
    instanceData.status = 'disconnected';
    io.emit('instance-status', { id: instanceId, status: 'disconnected' });
    client.initialize(); // Auto re-init
  });

  client.initialize().catch(err => console.error(`Init error for ${instanceId}:`, err));
};

io.on('connection', (socket) => {
  console.log('New socket connection');

  // Request status for all instances
  socket.on('get-all-instances', () => {
    const instances = Array.from(clients.values()).map(ins => ({
      id: ins.id,
      status: ins.status
    }));
    socket.emit('all-instances-status', instances);
  });

  socket.on('init-instance', (instanceId) => {
    createInstance(instanceId, socket);
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

server.listen(port, () => {
  console.log(`Multi-instance WhatsApp server running on port ${port}`);
});
