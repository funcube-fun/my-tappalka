const express = require('express');
     const app = express();
     app.use(express.json());

     app.post('/webhook', (req, res) => {
       const { message } = req.body;
       if (message && message.text === '/start') {
         res.json({
           method: 'sendMessage',
           chat_id: message.chat.id,
           text: 'Welcome! Tap to start!',
           reply_markup: {
             inline_keyboard: [[{ text: 'Open App', web_app: { url: 'https://my-tappalka-ik3Zcroum-ilyas-projects-5ic27Ofa.vercel.app' } }]]
           }
         });
       } else {
         res.sendStatus(200); // Подтверждение получения
       }
     });

     module.exports = app; // Экспорт для Vercel
