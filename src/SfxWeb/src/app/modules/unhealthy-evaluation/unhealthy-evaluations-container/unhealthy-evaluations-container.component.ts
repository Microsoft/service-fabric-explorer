import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { HealthEvaluation } from 'src/app/Models/DataModels/Shared';
import { IUnhealthyEvaluationNode, recursivelyBuildTree, getNestedNode, getParentPath, getLeafNodes, condenseTree } from 'src/app/Utils/healthUtils';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-unhealthy-evaluations-container',
  templateUrl: './unhealthy-evaluations-container.component.html',
  styleUrls: ['./unhealthy-evaluations-container.component.scss']
})
export class UnhealthyEvaluationsContainerComponent implements OnInit, OnChanges {

  static readonly STORAGE_LAYOUT_SETTING = 'UNHEALTHY-STORAGE_LAYOUT_SETTING-LAYOUT';
  static readonly STORAGE_ERRORS_ONLY_SETTING = 'STORAGE_ERRORS_ONLY_SETTING-EVALUATION-LAYOUT';
  static readonly STORAGE_LONG_DESCRIPTION_SETTING = 'STORAGE_LONG_DESCRIPTION_SETTING-EVALUATION-LAYOUT';

  @Input() healthEvaluations: HealthEvaluation[];

  rootPath: string[] = [];
  parentPath: IUnhealthyEvaluationNode[] = [];

  root: IUnhealthyEvaluationNode;
  viewNode: IUnhealthyEvaluationNode;
  originalRoot: IUnhealthyEvaluationNode = {
    healthEvaluation: null,
    children: [],
    parent: null,
    containsErrorInPath: false,
    displayNames: [],
    id: 'tree'
  };

  usingOriginalRoot = true;
  hiddenNodes = 0;

  view = '';

  condensed = true;
  errorOnly = false;
  fullDescriptions = false;
  constructor(private storageService: StorageService) { }

  ngOnChanges(): void {
    const roots = [];
    this.healthEvaluations.filter(node => node.parent === null).forEach(root => {
      const newNode = recursivelyBuildTree(root, this.originalRoot);
      roots.push(newNode);
    });

    this.originalRoot.children = roots;

    const updatedNode = getNestedNode(this.rootPath, this.originalRoot);
    if (updatedNode) {
      this.setNewRootNode(updatedNode);
    } else {
      this.setNewRootNode(this.originalRoot);
    }
    this.updateTree();
  }

  ngOnInit(): void {
    this.root = this.originalRoot;
    this.viewNode = this.root;

    this.view = this.storageService.getValueString(UnhealthyEvaluationsContainerComponent.STORAGE_LAYOUT_SETTING, 'Verbose');
    this.errorOnly = this.storageService.getValueBoolean(UnhealthyEvaluationsContainerComponent.STORAGE_ERRORS_ONLY_SETTING, false);
    this.fullDescriptions = this.storageService.getValueBoolean(UnhealthyEvaluationsContainerComponent.STORAGE_LONG_DESCRIPTION_SETTING, false);

    this.updateTree();
  }

  updateTree() {
    switch (this.view) {
      case 'Verbose':
        this.condensed = false;
        this.viewNode = this.root;
        break;
      case 'Condensed':
        this.condensed = true;
        this.viewNode = condenseTree(this.root);
        break;
      case 'Events':
        const children = getLeafNodes(this.root);
        this.viewNode = {
          healthEvaluation: null,
          children,
          parent: null,
          containsErrorInPath: false,
          displayNames: [],
          id: 'all events'
        };

        break;
      default:
        break;
    }

    if (this.view) {
      this.storageService.setValue(UnhealthyEvaluationsContainerComponent.STORAGE_LAYOUT_SETTING, this.view);
    }
  }

  setfullDescriptions() {
    this.storageService.setValue(UnhealthyEvaluationsContainerComponent.STORAGE_LONG_DESCRIPTION_SETTING, this.fullDescriptions);
  }

  setErrorOnlyStatus() {
    this.storageService.setValue(UnhealthyEvaluationsContainerComponent.STORAGE_ERRORS_ONLY_SETTING, this.errorOnly);
  }


  setNewRootNode(node: IUnhealthyEvaluationNode) {
    this.root = node;
    this.root.containsErrorInPath = this.root.children.some(child => child.containsErrorInPath);

    this.parentPath = getParentPath(node);
    this.rootPath = this.parentPath.slice(1).map(pathNode => pathNode.id);
    this.usingOriginalRoot = node === this.originalRoot;
    if (!this.usingOriginalRoot) {
      this.rootPath.push(this.root.id);
    }
    this.updateTree();
  }

  resetAnchor() {
    this.setNewRootNode(this.originalRoot);
  }

  goBackOneLevel() {
    this.setNewRootNode(this.root.parent);
  }

  getEvents() {
    const children = getLeafNodes(this.root);
    console.log(children);
    const newRoot: IUnhealthyEvaluationNode = {
      healthEvaluation: null,
      children,
      parent: null,
      containsErrorInPath: false,
      displayNames: [],
      id: 'all events'
    };
    this.setNewRootNode(newRoot);
  }
}
