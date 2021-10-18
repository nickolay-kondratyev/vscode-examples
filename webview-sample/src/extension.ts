import * as vscode from 'vscode';

const cats = {
  'Coding Cat': 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
  'Compiling Cat': 'https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif',
  'Testing Cat': 'https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif'
};

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('catCoding.start', () => {
      CatCodingPanel.createOrShow(context.extensionUri);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('catCoding.doRefactor', () => {
      if (CatCodingPanel.currentPanel) {
        CatCodingPanel.currentPanel.doRefactor();
      }
    })
  );

  if (vscode.window.registerWebviewPanelSerializer) {
    // Make sure we register a serializer in activation event
    vscode.window.registerWebviewPanelSerializer(CatCodingPanel.viewType, {
      async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
        console.log(`Got state: ${state}`);
        // Reset the webview options so we use latest uri for `localResourceRoots`.
        webviewPanel.webview.options = getWebviewOptions(context.extensionUri);
        CatCodingPanel.revive(webviewPanel, context.extensionUri);
      }
    });
  }
}

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
  return {
    // Enable javascript in the webview
    enableScripts: true,

    // And restrict the webview to only loading content from our extension's `media` directory.
    localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
  };
}

/**
 * Manages cat coding webview panels
 */
class CatCodingPanel {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: CatCodingPanel | undefined;

  public static readonly viewType = 'catCoding';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it.
    if (CatCodingPanel.currentPanel) {
      CatCodingPanel.currentPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      CatCodingPanel.viewType,
      'Cat Coding',
      column || vscode.ViewColumn.One,
      getWebviewOptions(extensionUri),
    );

    CatCodingPanel.currentPanel = new CatCodingPanel(panel, extensionUri);
  }

  public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    CatCodingPanel.currentPanel = new CatCodingPanel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // Set the webview's initial html content
    this._update();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programmatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Update the content based on view changes
    this._panel.onDidChangeViewState(
      e => {
        if (this._panel.visible) {
          this._update();
        }
      },
      null,
      this._disposables
    );

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'alert':
            vscode.window.showErrorMessage(message.text);
            return;
        }
      },
      null,
      this._disposables
    );
  }

  public doRefactor() {
    // Send a message to the webview webview.
    // You can send any JSON serializable data.
    this._panel.webview.postMessage({command: 'refactor'});
  }

  public dispose() {
    CatCodingPanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _update() {
    const webview = this._panel.webview;

    // Vary the webview's content based on where it is located in the editor.
    switch (this._panel.viewColumn) {
      case vscode.ViewColumn.Two:
        this._updateForCat(webview, 'Compiling Cat');
        return;

      case vscode.ViewColumn.Three:
        this._updateForCat(webview, 'Testing Cat');
        return;

      case vscode.ViewColumn.One:
      default:
        this._updateForCat(webview, 'Coding Cat');
        return;
    }
  }

  private _updateForCat(webview: vscode.Webview, catName: keyof typeof cats) {
    this._panel.title = catName;
    this._panel.webview.html = this._getHtmlForWebview({
      webview: webview,
      catName,
      catGifPath: cats[catName]
    });
  }

  private _getHtmlForWebview({webview, catGifPath, catName}: {
    webview: vscode.Webview, catGifPath: string, catName: string,
  }) {
    // Local path to main script run in the webview
    // And the uri we use to load this script in the webview
    const scriptUri = (vscode.Uri.joinPath(this._extensionUri, 'media', 'ma in.js'))
      .with({'scheme': 'vscode-resource'});

    const goScriptUri = (vscode.Uri.joinPath(this._extensionUri, 'media', 'go.js'))
      .with({'scheme': 'vscode-resource'});

    const anotherScriptUri = (vscode.Uri.joinPath(this._extensionUri, 'media', 'another.js'))
      .with({'scheme': 'vscode-resource'});


    // Local path to css styles
    const styleResetPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css');
    const stylesPathMainPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css');

    // Uri to load styles into webview
    const stylesResetUri = webview.asWebviewUri(styleResetPath);
    const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);

    // Use a nonce to only allow specific scripts to be run

    function getBorderColor(catName: string) {
      switch (catName) {
        case "Coding Cat":
          return '#076b1d';
        case "Compiling Cat":
          return '#07166b';
        case "Testing Cat":
          return '#6b3907';
        default:
          return '#ffffff';
      }
    }

    const borderColor = getBorderColor(catName);

    return `<!DOCTYPE html>
			<html lang="en">
			<style>
        .has-border {
         border-style: solid; 
         border-width: thick; 
         border-color: ${borderColor};
         padding: 5px;
         border-radius: 5px;
        }
      </style>
			<head>
				<meta charset="UTF-8">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${stylesResetUri}" rel="stylesheet">
				<link href="${stylesMainUri}" rel="stylesheet">

				<title>Cat Coding</title>
			</head>
			<body>
		    
		    <div class="has-border">${catName}</div> 
			  <h1 id="lines-of-code-counter">0</h1>

        <div id="my-div-1">
           Initial div-1 content
        </div>
  
        <div id="my-div-2">
           Initial div-2 content
        </div>
 
        <div id="my-div-3">
           Initial div-3 content
        </div>
			</body>
			  <script src="${anotherScriptUri}"/>
	      <script src="${goScriptUri}" />
			</html>`;
  }
}
