import { createWriteStream } from 'fs';

const source = 'https://ollama.com/search';
const page = await fetch(source).then(response => response.text());

const writer = createWriteStream('../source/models.ts');
writer.write(`import { Config } from "ollama";\n`);
writer.write(`import { OllamaModel } from "./model";\n\n`);

writer.write(`// automatically generated from ${source} on ${new Date().toDateString()}\n`);
writer.write(`// works as a reference to quickly use a model, but any model can be used by using the \`OllamaModel\` base class\n\n`);

for (let model of page.split('<span x-test-search-response-title>').slice(1)) {
	const name = model.split('</span>')[0];
	const sizes = [];

	for	(let tag of model.split('<span x-test-size').slice(1)) {
		const size = tag.split('>')[1]?.split('<')[0];

		sizes.push(size);
	}

	let className = name
		.split('-')
		.map((word, index) => word.charAt(0).toUpperCase() + word.substring(1))
		.join('')
		.replace(/[^0-9a-zA-Z]/g, '_');

	writer.write(`export class ${className}Model extends OllamaModel {\n`);
	writer.write(`\tconstructor(\n`);

	if (sizes.length) {
		writer.write(`\t\tpublic size: ${sizes.map(size => `'${size}'`).join(' | ')},\n`);
	}

	writer.write(`\t\tconfiguration?: Partial<Config>\n`);
	writer.write(`\t) {\n`);
	writer.write(`\t\tsuper(`);

	if (sizes.length) {
		writer.write(`\`${name}:\${size}\``);
	} else {
		writer.write(`'${name}'`);
	}

	writer.write(`, configuration);\n`);
	writer.write('\t}\n');
	writer.write('}\n\n');
}
