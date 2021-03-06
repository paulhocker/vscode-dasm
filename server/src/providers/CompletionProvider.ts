import {
	CompletionItem,
	CompletionItemKind,
	IConnection,
	TextDocumentPositionParams,
} from "vscode-languageserver";

import LanguageDefinition, { IInstruction, IPseudoOp } from "../definitions/LanguageDefinition";
import { ISymbol } from "./Assembler";
import { IProjectInfoProvider, Provider } from "./Provider";

enum LanguageCompletionTypes {
	Instruction,
	Symbol,
	Label,
	Register,
	PseudoOp,
}

interface ICompletionData {
	type: LanguageCompletionTypes;
	payload: Object;
}

export default class CompletionProvider extends Provider {

	constructor(connection:IConnection, projectInfoProvider:IProjectInfoProvider) {
		super(connection, projectInfoProvider);

		// Provides the initial list of the completion items
		connection.onCompletion((textDocumentPosition:TextDocumentPositionParams): CompletionItem[] => {
			return this.createCompletionItems(textDocumentPosition);
		});

		connection.onCompletionResolve((item:CompletionItem):CompletionItem => {
			return this.processItem(item);
		});
	}

	/**
	 * Based on the existing language definition, returns all possible auto-completion items
	 */
	private createCompletionItems(textDocumentPosition:TextDocumentPositionParams):CompletionItem[] {
		// TODO: provide proper items based on the position (right now it's everything)

		const items:CompletionItem[] = [];

		const settings = this.getProjectInfo().getSettings();
		const results = this.getProjectInfo().getResults();

		const allUppercase = settings.preferUppercase.indexOf("all") >= 0;
		const instructionUppercase = allUppercase || settings.preferUppercase.indexOf("instructions") >= 0;
		const pseudoOpsUppercase = allUppercase || settings.preferUppercase.indexOf("pseudoops") >= 0;
		//const registersUppercase = allUppercase || settings.preferUppercase.indexOf("registers") >= 0;

		// Instructions
		for (let instruction of LanguageDefinition.Instructions) {
			const name = instructionUppercase ? instruction.name.toLocaleUpperCase() : instruction.name.toLocaleUpperCase();
			items.push(this.createCompletionItem(name, LanguageCompletionTypes.Instruction, instruction));
		}

		// PseudoOps
		for (let pseudoOp of LanguageDefinition.PseudoOps) {
			const name = pseudoOpsUppercase ? pseudoOp.name.toLocaleUpperCase() : pseudoOp.name.toLocaleUpperCase();
			items.push(this.createCompletionItem(name, LanguageCompletionTypes.PseudoOp, pseudoOp));
		}

		// TODO: registers
		// TODO: filenames for include
		// TODO: parameters

		// Symbols
		if (results && results.symbols) {
			for (let symbol of results.symbols) {
				if (symbol.isConstant) {
					// Values
					items.push(this.createCompletionItem(symbol.name, LanguageCompletionTypes.Symbol, symbol));
				} else {
					// Labels
					items.push(this.createCompletionItem(symbol.name, LanguageCompletionTypes.Label, symbol));
				}
			}
		}

		return items;
	}

	private createCompletionItem(label:string, type:LanguageCompletionTypes, payload:any):CompletionItem {
		return {
			label,
			kind: CompletionItemKind.Text,
			data: {
				type,
				payload,
			},
		};
	}

	/**
	 * Based on the current completion item, provide further completion information
	 */
	private processItem(item:CompletionItem):CompletionItem {
		const completionData:ICompletionData = item.data;

		let detail:string|undefined;
		let documentation:string|undefined;

		// TODO: better distinction between detail/description
		// TODO: also support .otherNames for pseudo-ops

		switch (completionData.type) {
			case LanguageCompletionTypes.Instruction:
				const instruction:IInstruction = <IInstruction>completionData.payload;
				detail = instruction.description;
				documentation = instruction.description;
				break;
			case LanguageCompletionTypes.PseudoOp:
				const pseudoOp:IPseudoOp = <IPseudoOp>completionData.payload;
				detail = pseudoOp.description;
				documentation = pseudoOp.documentation.join("\n");
				break;
			case LanguageCompletionTypes.Symbol:
				const symbol:ISymbol = <ISymbol>completionData.payload;
				detail = `Symbol ${symbol.name} with value ${symbol.value}`;
				documentation = symbol.name + " = " + symbol.value;
				break;
			case LanguageCompletionTypes.Label:
				const label:ISymbol = <ISymbol>completionData.payload;
				detail = `Label ${label.name} at position ${label.value}`;
				documentation = label.name + " = " + label.value;
				break;
			default:
				console.warn("[completion] Type of completion", item, "not understood.");
		}

		if (detail) {
			item.detail = detail;
			item.documentation = documentation;
		}

		return item;
	}
}
