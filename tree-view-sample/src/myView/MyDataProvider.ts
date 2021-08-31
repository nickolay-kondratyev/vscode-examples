import * as vscode from 'vscode';
import { ProviderResult, TreeItem, TreeItemCollapsibleState } from 'vscode';

export class MyDataProvider implements vscode.TreeDataProvider<{ key: string }> {
  constructor() {
    console.log(`CTOR MyDataProvider`);
  }
  getChildren(element?: { key: string }): ProviderResult<{ key: string }[]> {
    console.log(`Get children is called.`);

    if (!element) {
      return [{
        key: 'key value'
      }];
    }
    return [];
  }

  getTreeItem(element: { key: string }): TreeItem | Thenable<TreeItem> {
    return {
      label: element.key,
      collapsibleState: TreeItemCollapsibleState.Collapsed,
      tooltip: element.key
    };
  }
}
