'use client';

import { useState } from 'react';
import { useSocket } from '../context/SocketProvider';

export default function Home() {
  const { sendMessage, messages } = useSocket();
  const [Message, setMessage] = useState('');

  return (
    <div>
      <div>
        <h1>Home</h1>
        <div>
          {messages.map((msg, i) => (
            <div key={i}>{msg}</div>
          ))}
        </div>
      </div>
      <div>
        <input
          className='chat-input'
          placeholder='Message...'
          value={Message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button className='button' onClick={() => sendMessage(Message)}>
          Send
        </button>
      </div>
    </div>
  );
}
