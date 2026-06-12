import { Server } from 'http';
import { RawData, WebSocket } from 'ws';
import { startServer, waitForSocketState } from './index';
import { Message, User } from './interfaces';
const port = 3000;
describe('WebSocket Server', () => {
  let server: Server;
  let user: User;
  let client = WebSocket;

  let testNewUserMessage: Message;
  beforeAll(async () => {
    user = {
      id: '1',
      name: 'Test User',
    };
    server = await startServer(port);
  });
  afterAll(() => server.close());
  test('Send "New User" from Client', async () => {
    const testMessage: Message = {
      type: 'newUser',
      user: user,
    };
    // Create test client
    const client = new WebSocket(`ws://localhost:${port}`);
    await waitForSocketState(client, client.OPEN);
    let responseMessage;
    client.on('message', (data: RawData) => {
      responseMessage = JSON.parse(data.toString());
      // Close the client after it receives the response
      client.close();
    });
    // Send client message
    client.send(JSON.stringify(testMessage));
    // Perform assertions on the response
    await waitForSocketState(client, client.CLOSED);
    const expectedMessage: Message = {
      type: 'activeUsers',
      users: [user],
    };
    expect(responseMessage).toEqual(expectedMessage);
  });
  test('Send "Message" from Client', async () => {
    const testMessage: Message = {
      type: 'message',
      user: user,
      message: 'Test Message',
    };
    // Create test client
    const client = new WebSocket(`ws://localhost:${port}`);
    await waitForSocketState(client, client.OPEN);
    let responseMessage;
    client.on('message', (data: RawData) => {
      responseMessage = JSON.parse(data.toString());
      // Close the client after it receives the response
      client.close();
    });
    // Send client message
    client.send(JSON.stringify(testMessage));
    // Perform assertions on the response
    await waitForSocketState(client, client.CLOSED);
    expect(responseMessage).toEqual(testMessage);
  });
  test('Send "typing" from Client and wait until not typing timeout', async () => {
    const testMessage: Message = {
      type: 'typing',
      user: user,
    };
    // Create test client
    const client = new WebSocket(`ws://localhost:${port}`);
    await waitForSocketState(client, client.OPEN);
    let responseMessages: Message[] = [];
    let messageCounter = 0;
    client.on('message', (data: RawData) => {
      responseMessages.push(JSON.parse(data.toString()));
      messageCounter++;
      // Close the client after it receives the response
      if (messageCounter >= 2) {
        client.close();
      }
    });
    // Send client message
    client.send(JSON.stringify(testMessage));
    // Perform assertions on the response
    await waitForSocketState(client, client.CLOSED);
    const expectedMessage: Message = {
      type: 'typing',
      users: [user],
    };
    expect(responseMessages[0]).toEqual(expectedMessage);
    expect(responseMessages[1]).toEqual({ type: 'typing', users: [] });
  });
});
