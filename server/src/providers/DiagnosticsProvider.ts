import {
	Diagnostic,
	DiagnosticSeverity,
	IConnection,
} from "vscode-languageserver";

import { IPostCompilationProvider, IProjectInfoProvider, Provider } from "./Provider";

export default class DiagnosticsProvider extends Provider implements IPostCompilationProvider {

	constructor(connection:IConnection, projectInfoProvider:IProjectInfoProvider) {
		super(connection, projectInfoProvider);
	}

	/**
	 * Assembles a source and returns diagnostics errors
	 */
	public process(uri:string):void {
		const diagnostics:Diagnostic[] = [];
		const sourceLines = this.getProjectInfo().getSource();
		const results = this.getProjectInfo().getResults();

		if (sourceLines && results && results.list && results.list.length > 0) {
			results.list.forEach((line) => {
				if (line.errorMessage) {
					const lineIndex = line.number - 1;
					const range = this.findRangeForError(sourceLines[lineIndex], line.errorMessage);
					diagnostics.push({
						severity: DiagnosticSeverity.Error,
						range: {
							start: { line: lineIndex, character: range.start },
							end: { line: lineIndex, character: range.end },
						},
						message: line.errorMessage,
						source: "dasm",
					});
				}
			});
		}

		this.getConnection().sendDiagnostics({ uri, diagnostics });
	}

	private findRangeForError(line:string, errorMessage:string):{ start:number, end:number } {
		// Based on a raw line and an error message, find the starting and end position for the error
		// E.g. "Processor 'xx' not supported"
		let start = 0;
		let end = line.length;
		if (errorMessage) {
			const errorMatch = /'(.*)'/;
			const matches = errorMessage.match(errorMatch);
			if (matches) {
				const errorString = matches[1];
				if (errorString) {
					const pos = line.indexOf(errorString);
					if (pos > -1) {
						start = pos;
						end = start + errorString.length;
					}
				}
			}
		}
		return { start, end };
	}
}
