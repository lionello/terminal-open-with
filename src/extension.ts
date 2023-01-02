// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import open from "open";
import assert from "assert";

// This interface should be kept in sync with "terminalOpenWith.mappings" in package.json
interface AppMapping {
  readonly glob: string;
  readonly app: "chrome" | "firefox" | "edge" | "code" | "default";
  readonly args?: string[];
}

interface CustomTerminalLink extends vscode.TerminalLink {
  url: string;
  mapping: AppMapping;
}

// A function to convert a glob pattern to a regular expression; supports globstars.
export function globToRegExp(glob: string): string {
  return glob
    .replace(/[.+^${}()|[\]\\]/g, "\\$&") // $& means the whole matched string
    .replace(/\*\*?/g, (a) => (a === "*" ? "[^/\\\\]*" : ".*"))
    .replace(/\?/g, "[^/\\\\]");
}

// Constant for the mappings configuration
const MAPPINGS = "terminalOpenWith.mappings";

function getMappings(): readonly AppMapping[] {
  return vscode.workspace.getConfiguration().get(MAPPINGS) as AppMapping[];
}

// A function to create a regular expression from the mappings configuration
export function makeRegExp(mappings: readonly AppMapping[]): RegExp {
  const regexp = mappings
    .map((mapping) => "(" + globToRegExp(mapping.glob) + ")")
    .join("|");
  return new RegExp(regexp, "g");
}

export function getApp(mapping: AppMapping): open.App | undefined {
  switch (mapping.app) {
    case "code":
      assert(false); // should not be called for "code"
    case "chrome":
    case "firefox":
    case "edge":
      return { name: open.apps[mapping.app], arguments: mapping.args };
    case "default":
      assert(mapping.args === undefined); // not supported for "default"
      return undefined;
    default:
      return { name: mapping.app, arguments: mapping.args };
  }
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let mappings = getMappings();
  let regexp = makeRegExp(mappings);

  context.subscriptions.push(
    vscode.window.registerTerminalLinkProvider({
      provideTerminalLinks: (
        context: vscode.TerminalLinkContext,
        token: vscode.CancellationToken
      ) => {
        const matches = [...context.line.matchAll(regexp)];
        return matches.map((match) => {
          const idx = match.findIndex((value, index) => value && index);
          assert(idx > 0); // at least one group should match
          const mapping = mappings[idx - 1];
          assert(mapping); // should have a corresponding mapping
          const url = match[idx];
          assert(url); // should have matched a non-empty url
          return {
            startIndex: match.index,
            tooltip: "Open in " + mapping.app,
            length: url.length,
            url,
            mapping,
          } as CustomTerminalLink;
        });
      },
      handleTerminalLink: async (link: CustomTerminalLink) => {
        if (link.mapping.app === "code") {
          await vscode.commands.executeCommand(
            "vscode.open",
            vscode.Uri.parse(link.url)
          );
        } else {
          const app = getApp(link.mapping);
          await open(link.url, { app });
        }
      },
    })
  );

  // Listening to configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(MAPPINGS)) {
        mappings = getMappings();
        regexp = makeRegExp(mappings);
      }
    })
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
