import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src/data');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

export interface Message {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    date: string;
    read: boolean;
}

export const messageService = {
    async getMessages(): Promise<Message[]> {
        try {
            const content = await fs.readFile(MESSAGES_FILE, 'utf-8');
            return JSON.parse(content);
        } catch (error) {
            console.error('Error reading messages:', error);
            return [];
        }
    },

    async saveMessage(data: Omit<Message, 'id' | 'date' | 'read'>): Promise<Message> {
        const messages = await this.getMessages();

        const newMessage: Message = {
            ...data,
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            read: false,
        };

        messages.push(newMessage);

        await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2));
        return newMessage;
    },

    async markAsRead(id: string): Promise<boolean> {
        const messages = await this.getMessages();
        const index = messages.findIndex(m => m.id === id);

        if (index === -1) return false;

        messages[index].read = true;
        await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2));
        return true;
    },

    async deleteMessage(id: string): Promise<boolean> {
        const messages = await this.getMessages();
        const filtered = messages.filter(m => m.id !== id);

        if (filtered.length === messages.length) return false;

        await fs.writeFile(MESSAGES_FILE, JSON.stringify(filtered, null, 2));
        return true;
    }
};
