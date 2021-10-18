import * as vscode from 'vscode';
import { ProviderResult, TreeItem, TreeItemCollapsibleState } from 'vscode';

export class MyDataProvider implements vscode.TreeDataProvider<{ key: string }> {

  getChildren(element?: { key: string }): ProviderResult<{ key: string }[]> {
    if (!element) {
      return [{
        key: 'k1'
      },
        {
          key: 'k2'
        }];
    }
    if (element.key === 'k1') {
      return [{key: 'k1-a'}];
    }
    if (element.key === 'k1-a') {
      return [{key: 'k1-a-I'}, {key: 'k1-a-II'}];
    }
    if (element.key === 'k2') {
      return [{key: 'k2-a'}];
    }
    return [];
  }

  getParent(element: { key: string }): ProviderResult<{ key: string }> {
    if (element.key === 'k1-a'){
      return {key: 'k1'};
    }
    return undefined;
  }

  getTreeItem(element: { key: string }): TreeItem | Thenable<TreeItem> {
    return {
      label: element.key,
      collapsibleState: TreeItemCollapsibleState.Collapsed,
      tooltip: element.key
    };
  }
}
