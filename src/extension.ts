// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as open from "open";

export const CHROME_REGEX = /https:\/\/g\.co\/sc\b/g;

interface CustomTerminalLink extends vscode.TerminalLink {
  url: string;
  app: open.App;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.window.registerTerminalLinkProvider({
    provideTerminalLinks: (
      context: vscode.TerminalLinkContext,
      token: vscode.CancellationToken
    ) => {
      const matches = [...context.line.matchAll(CHROME_REGEX)];
      return matches.map((match) => {
        return {
          startIndex: match.index,
          length: match[0].length,
          tooltip: "Open in chrome",
          url: match[0],
          app: { name: open.apps.chrome },
        } as CustomTerminalLink;
      });
    },
    handleTerminalLink: async (link: CustomTerminalLink) => {
      await open(link.url, { app: link.app });
    },
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
