const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const { Server } = require('socket.io');
const http = require('http');

const port = 3001;
const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let client;

const initWhatsApp = (socket) => {
  if (client) {
    socket.emit('status', 'connecting');
    return;
  }

  client = new Client({
    authStrategy: new LocalAuth({
      dataPath: './.wwebjs_auth'
    }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-extensions',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ],
    }
  });

  client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit('qr', url);
      socket.emit('status', 'disconnected');
    });
  });

  client.on('ready', () => {
    console.log('CLIENT READY');
    socket.emit('status', 'connected');
  });

  client.on('authenticated', () => {
    console.log('AUTHENTICATED');
  });

  client.on('auth_failure', (msg) => {
    console.error('AUTH FAILURE', msg);
    socket.emit('status', 'disconnected');
  });

  client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
    socket.emit('status', 'disconnected');
    client.initialize();
  });

  client.initialize();
};

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('init', () => {
    initWhatsApp(socket);
  });

  socket.on('send-message', async ({ to, message }) => {
    if (!client) return;
    try {
      const chatId = to.includes('@c.us') ? to : `${to}@c.us`;
      await client.sendMessage(chatId, message);
      socket.emit('message-sent', { to, success: true });
    } catch (err) {
      console.error('Error sending message:', err);
      socket.emit('message-sent', { to, success: false, error: err.message });
    }
  });
});

server.listen(port, () => {
  console.log(`WhatsApp Server running on port ${port}`);
});
