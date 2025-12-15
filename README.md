# @morphsync/event

> A lightweight event handler for sending HTTP notifications with dynamic placeholder replacement and multi-recipient support.

[![npm version](https://img.shields.io/npm/v/@morphsync/event.svg)](https://www.npmjs.com/package/@morphsync/event)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## Features

- 🚀 Send HTTP notifications to multiple recipients
- 🔄 Dynamic placeholder replacement with {{variable}} syntax
- 🎯 Support for nested object properties ({{user.name}})
- 📦 Built on Axios for reliable HTTP requests
- ⚡ Promise-based async/await API
- 🔧 Custom headers support
- 📝 Success and error callbacks
- 🎨 Support for GET, POST, PUT, DELETE methods

## Installation

```bash
npm install @morphsync/event
```

## Quick Start

```javascript
const Event = require('@morphsync/event');

// Create event instance with configuration
const event = new Event({
    eventRequestUrl: 'https://api.example.com/notify',
    eventRequestType: 'POST',
    eventRequestData: {
        message: 'Hello {{name}}, your order {{orderId}} is ready!'
    },
    eventData: [
        { name: 'John', orderId: '12345' },
        { name: 'Jane', orderId: '67890' }
    ]
});

// Handle the event and send notifications
const responses = await event.handleEvent();
console.log(responses);
```

## Usage

### Basic Notification

```javascript
const Event = require('@morphsync/event');

const event = new Event({
    eventRequestUrl: 'https://api.example.com/webhook',
    eventRequestType: 'POST',
    eventRequestData: {
        title: 'New User Registration',
        message: 'User {{email}} has registered'
    },
    eventData: [
        { email: 'john@example.com' },
        { email: 'jane@example.com' }
    ]
});

await event.handleEvent();
```

### With Custom Headers

```javascript
const Event = require('@morphsync/event');

const event = new Event({
    eventRequestUrl: 'https://api.example.com/notify',
    eventRequestType: 'POST',
    eventRequestHeaders: {
        'Authorization': 'Bearer your-token-here',
        'X-Custom-Header': 'custom-value'
    },
    eventRequestData: {
        message: 'Payment of ${{amount}} received from {{customerName}}'
    },
    eventData: [
        { amount: 99.99, customerName: 'John Doe' }
    ]
});

await event.handleEvent();
```

### Nested Object Properties

```javascript
const Event = require('@morphsync/event');

const event = new Event({
    eventRequestUrl: 'https://api.example.com/notify',
    eventRequestType: 'POST',
    eventRequestData: {
        message: 'Hello {{user.firstName}} {{user.lastName}}',
        email: '{{user.contact.email}}',
        phone: '{{user.contact.phone}}'
    },
    eventData: [
        {
            user: {
                firstName: 'John',
                lastName: 'Doe',
                contact: {
                    email: 'john@example.com',
                    phone: '+1234567890'
                }
            }
        }
    ]
});

await event.handleEvent();
```

### Error Handling

```javascript
const Event = require('@morphsync/event');

const event = new Event({
    eventRequestUrl: 'https://api.example.com/notify',
    eventRequestType: 'POST',
    eventRequestData: {
        message: 'Order {{orderId}} shipped to {{customerName}}'
    },
    eventData: [
        { orderId: '12345', customerName: 'John Doe' }
    ]
});

try {
    const responses = await event.handleEvent();
    console.log('Notifications sent successfully:', responses);
} catch (error) {
    console.error('Event handling failed:', error.message);
}
```

## API Reference

### new Event(event)

Creates a new Event instance.

**Parameters:**
- `event` (object): Event configuration object
  - `eventRequestUrl` (string, required): The API endpoint URL
  - `eventRequestType` (string, required): HTTP method (GET, POST, PUT, DELETE)
  - `eventRequestHeaders` (object, optional): Custom headers for the request
  - `eventRequestData` (object|string, required): Request data with placeholders
  - `eventData` (array, required): Array of objects containing replacement values

**Returns:** Event instance

### handleEvent()

Processes the event by sending HTTP requests for each item in eventData.

**Returns:** Promise<Array> - Array of responses from all requests

## Complete Examples

### Email Notification

```javascript
const Event = require('@morphsync/event');

const event = new Event({
    eventRequestUrl: 'https://api.sendgrid.com/v3/mail/send',
    eventRequestType: 'POST',
    eventRequestHeaders: {
        'Authorization': 'Bearer YOUR_SENDGRID_API_KEY'
    },
    eventRequestData: {
        personalizations: [{
            to: [{ email: '{{email}}' }],
            subject: 'Welcome {{name}}'
        }],
        from: { email: 'noreply@example.com' },
        content: [{
            type: 'text/plain',
            value: 'Hello {{name}}, welcome to our platform!'
        }]
    },
    eventData: [
        { name: 'John', email: 'john@example.com' },
        { name: 'Jane', email: 'jane@example.com' }
    ]
});

await event.handleEvent();
```

### Slack Webhook

```javascript
const Event = require('@morphsync/event');

const event = new Event({
    eventRequestUrl: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',
    eventRequestType: 'POST',
    eventRequestData: {
        text: 'New order received!',
        blocks: [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: '*Order ID:* {{orderId}}\n*Customer:* {{customerName}}\n*Amount:* ${{amount}}'
                }
            }
        ]
    },
    eventData: [
        { orderId: '12345', customerName: 'John Doe', amount: 99.99 }
    ]
});

await event.handleEvent();
```

### Database Integration

```javascript
const Event = require('@morphsync/event');
const { MySQL } = require('@morphsync/mysql-db');

async function sendOrderNotifications() {
    const db = new MySQL();
    await db.connect();

    const orders = await db.table('orders')
        .where('status', 'pending')
        .where('notified', '0')
        .get();

    const event = new Event({
        eventRequestUrl: 'https://api.example.com/notify',
        eventRequestType: 'POST',
        eventRequestData: {
            orderId: '{{orderId}}',
            customerName: '{{customerName}}',
            amount: '{{amount}}',
            message: 'Your order {{orderId}} is being processed'
        },
        eventData: orders
    });

    const responses = await event.handleEvent();
    console.log('Notifications sent:', responses.length);
    
    await db.disconnect();
}
```

### Express Controller

```javascript
const Event = require('@morphsync/event');

class NotificationController {
    static async sendWelcomeEmail(req, res) {
        const { users } = req.body;

        try {
            const event = new Event({
                eventRequestUrl: process.env.EMAIL_API_URL,
                eventRequestType: 'POST',
                eventRequestHeaders: {
                    'Authorization': `Bearer ${process.env.EMAIL_API_KEY}`
                },
                eventRequestData: {
                    to: '{{email}}',
                    subject: 'Welcome {{name}}',
                    body: 'Hello {{name}}, welcome to our platform!'
                },
                eventData: users
            });

            const responses = await event.handleEvent();
            res.json({ success: true, sent: responses.length });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = NotificationController;
```

## Error Handling

```javascript
const event = new Event({
    eventRequestUrl: 'https://api.example.com/notify',
    eventRequestType: 'POST',
    eventRequestData: { message: 'Hello {{name}}' },
    eventData: [{ name: 'John' }]
});

try {
    const responses = await event.handleEvent();
    console.log('Success:', responses);
} catch (error) {
    if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
    } else if (error.request) {
        console.error('No response received');
    } else {
        console.error('Error:', error.message);
    }
}
```

## Dependencies

- [axios](https://www.npmjs.com/package/axios) - Promise based HTTP client

## License

ISC

## Author

Morphsync

## Related Packages

- [@morphsync/logger](https://www.npmjs.com/package/@morphsync/logger) - Logger utility with automatic file organization
- [@morphsync/http-request](https://www.npmjs.com/package/@morphsync/http-request) - HTTP request utility
- [@morphsync/mysql-db](https://www.npmjs.com/package/@morphsync/mysql-db) - MySQL query builder

## Support

For issues and questions, please visit the [GitHub repository](https://github.com/morphsync/morphsync-event).
#   m o r p h s y n c - e v e n t  
 