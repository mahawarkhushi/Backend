const Imap = require('node-imap');
const { simpleParser } = require('mailparser');
const { EventEmitter } = require('events');
const categorizeEmail = require('./categorizeEmail'); // Import the categorizer

function startImapConnection({ email, password, host, port, tls }) {
  const emitter = new EventEmitter();

  const imap = new Imap({
    user: email,
    password,
    host,
    port,
    tls,
    tlsOptions: { rejectUnauthorized: false }
  });

  function openInbox(cb) {
    imap.openBox('INBOX', false, cb);
  }

  imap.once('ready', () => {
    console.log(`Connected to ${email}`);
    openInbox((err, box) => {
      if (err) throw err;

      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - 30);
      const searchCriteria = [['SINCE', sinceDate.toDateString()]];

      imap.search(searchCriteria, (err, results) => {
        if (err) throw err;

        if (!results || results.length === 0) {
          console.log(`No recent emails for ${email}`);
        } else {
          const fetch = imap.fetch(results, { bodies: '' });
          fetch.on('message', (msg) => {
            msg.on('body', (stream) => {
              simpleParser(stream, (err, mail) => {
                if (err) console.error(err);
                else {
                  // Categorize the email
                  const label = categorizeEmail(mail.subject || '', mail.text || '');
                  console.log(`📩 [${email}] Subject: ${mail.subject}`);
                  console.log(`📌 Category: ${label}`);
                  emitter.emit('new-email', mail);
                }
              });
            });
          });
        }
      });

      imap.on('mail', () => {
        const fetch = imap.seq.fetch('1:*', {
          bodies: '',
          struct: true,
          markSeen: false
        });

        fetch.on('message', (msg) => {
          msg.on('body', (stream) => {
            simpleParser(stream, (err, mail) => {
              if (err) console.error(err);
              else {
                const label = categorizeEmail(mail.subject || '', mail.text || '');
                console.log(`New email for ${email}:`, mail.subject);
                console.log(`📌 Category: ${label}`);
                emitter.emit('new-email', mail);
              }
            });
          });
        });
      });
    });
  });

  imap.once('error', (err) => {
    console.error(`IMAP error for ${email}:`, err);
  });

  imap.once('end', () => {
    console.log(`Connection ended for ${email}`);
  });

  imap.connect();

  return emitter;
}

module.exports = startImapConnection;
