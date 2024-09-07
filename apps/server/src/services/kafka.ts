import { readFileSync } from 'fs';
import { Kafka, Producer } from 'kafkajs';
import { resolve } from 'path';
import { prisma } from './prisma';

const kafka = new Kafka({
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  sasl: {
    mechanism: 'plain',
    username: process.env.KAFKA_USERNAME || '',
    password: process.env.KAFKA_PASSWORD || '',
  },
  ssl: {
    ca: [readFileSync(resolve('./ca.pem'), 'utf-8')],
  },
});

let producer: null | Producer = null;

export async function createProducer() {
  if (producer) {
    return producer;
  }
  const _producer = kafka.producer();
  await _producer.connect();

  producer = _producer;
  return producer;
}

export async function produceMessage(message: string) {
  const producer = await createProducer();

  await producer.send({
    topic: 'MESSAGES',
    messages: [{ key: `message-${Date.now()}`, value: message }],
  });

  return true;
}

export async function consumeMessage() {
  const consumer = kafka.consumer({ groupId: 'test-group' });

  await consumer.connect();
  await consumer.subscribe({ topic: 'MESSAGES', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ pause, message }) => {
      console.log('Received message:');
      if (!message.value) {
        return;
      }
      try {
        await prisma.message.create({
          data: {
            text: message.value.toString(),
          },
        });
      } catch (error) {
        console.error('Error saving message:', error);
        pause();
        setTimeout(() => {
          consumer.resume([{ topic: 'MESSAGES' }]);
        }, 60 * 1000);
      }
    },
  });
}

export default kafka;
