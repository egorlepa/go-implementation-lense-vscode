const vscode = require("vscode");

class MyCodeLensProvider {

	/**
	 * @param {vscode.ExtensionContext} context
	 */
	constructor(context) {
		this.context = context;
	}

	/**
	 * @param {vscode.TextDocument} document
	 */
	async provideCodeLenses(document) {
		return await this.computeCodeLenses(document);
	}

	/**
	 * @param {vscode.TextDocument} document
	 */
	async computeCodeLenses(document) {
		const codeLenses = [];
		const symbols = await findSuitableSymbols(document);

		for (const s of symbols) {
			const implemented = await findImplemented(s);
			if (implemented.length > 0) {
				const command = {
					title: `$(link) impls: ${implemented.length}`,
					command: "goimpllense.goToImpl",
					arguments: [s.uri, s.detail],
				};
				new vscode.CodeLens(new vscode.Range(s.position, s.position), command).isResolved
				codeLenses.push(new vscode.CodeLens(new vscode.Range(s.position, s.position), command));
			}
		}

		return codeLenses;
	}

}

const suitableKinds = [
	vscode.SymbolKind.Struct,
	vscode.SymbolKind.Class,
	vscode.SymbolKind.Interface,
	vscode.SymbolKind.Method,
];

/**
 * @param {vscode.TextDocument} document
 */
async function findSuitableSymbols(document) {
	/** @type {(vscode.SymbolInformation & vscode.DocumentSymbol)[]} */
	let symbols = await vscode.commands.executeCommand("vscode.executeDocumentSymbolProvider", document.uri);
	symbols = flattenSymbols(symbols);
	return symbols
		.filter((symbol) => suitableKinds.includes(symbol.kind))
		.map((symbol) => {
			return {
				uri: symbol.location.uri,
				position: symbol.selectionRange.start,
				detail: symbol.detail
			};
		});
}

/**
 * @param {vscode.Uri} uri
 * @param {string} detail
 */
async function findSymbol(uri, detail) {
	/** @type {(vscode.SymbolInformation & vscode.DocumentSymbol)[]} */
	let symbols = await vscode.commands.executeCommand("vscode.executeDocumentSymbolProvider", uri);
	symbols = flattenSymbols(symbols);
	return symbols
		.find((symbol) => symbol.detail === detail)
}

/**
 * @param {vscode.DocumentSymbol[]} symbols
 */
function flattenSymbols(symbols) {
	return symbols.flatMap((symbol) => [symbol, ...flattenSymbols(symbol.children)]);
}

/**
 * @param {{ uri: vscode.Uri; position: vscode.Position; }} symbol
 */
async function findImplemented(symbol) {
	/** @type {vscode.Location[]} */
	const implemented = await vscode.commands.executeCommand(
		"vscode.executeImplementationProvider",
		symbol.uri,
		symbol.position
	);
	return implemented;
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	const provider = new MyCodeLensProvider(context);

	context.subscriptions.push(
		vscode.languages.registerCodeLensProvider({ pattern: "**/*.go" }, provider)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("goimpllense.goToImpl", async (uri, detail) => {
			const editor = await vscode.window.showTextDocument(uri);
			const symbol = await findSymbol(uri, detail)
			editor.selection = new vscode.Selection(symbol.selectionRange.start, symbol.selectionRange.start);
			vscode.commands.executeCommand("editor.action.goToImplementation");
		})
	);

}

function deactivate() { }

module.exports = {
	activate,
	deactivate,
};
