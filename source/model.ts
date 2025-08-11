import { AssistantMessage, InterpreterMessage, SystemMessage, UserMessage } from '@acryps/interpreter';
import { Config, Ollama } from 'ollama';

export class OllamaModel {
	ollama: Ollama;

	constructor(
		public model: string,
		public configuration?: Partial<Config>
	) {
		this.ollama = new Ollama();
	}

	async execute(messages: InterpreterMessage[]) {
		const response = await this.ollama.chat({
			model: this.model,
			messages: messages.map(message => OllamaModel.serialize(message))
		});

		return response.message.content;
	}

	static serialize(message: InterpreterMessage) {
		return {
			role: this.messageRole(message),
			content: message.message
		}
	}

	static messageRole(message: InterpreterMessage) {
		if (message instanceof SystemMessage) {
			return 'system';
		}

		if (message instanceof UserMessage) {
			return 'user';
		}

		if (message instanceof AssistantMessage) {
			return 'assistant';
		}

		throw new Error(`Unsupported message type '${message}'`);
	}
}
