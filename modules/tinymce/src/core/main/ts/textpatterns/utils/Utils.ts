/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional } from '@ephox/katamari';

import DOMUtils from '../../api/dom/DOMUtils';
import Editor from '../../api/Editor';
import * as Options from '../../api/Options';
import * as NodeType from '../../dom/NodeType';

const cleanEmptyNodes = (dom: DOMUtils, node: Node, isRoot: (e: Node) => boolean): void => {
  // Recursively walk up the tree while we have a parent and the node is empty. If the node is empty, then remove it.
  if (node && dom.isEmpty(node) && !isRoot(node)) {
    const parent = node.parentNode;
    dom.remove(node);
    cleanEmptyNodes(dom, parent, isRoot);
  }
};

const deleteRng = (dom: DOMUtils, rng: Range, isRoot: (e: Node) => boolean, clean = true): void => {
  const startParent = rng.startContainer.parentNode;
  const endParent = rng.endContainer.parentNode;
  rng.deleteContents();

  // Clean up any empty nodes if required
  if (clean && !isRoot(rng.startContainer)) {
    if (NodeType.isText(rng.startContainer) && rng.startContainer.data.length === 0) {
      dom.remove(rng.startContainer);
    }
    if (NodeType.isText(rng.endContainer) && rng.endContainer.data.length === 0) {
      dom.remove(rng.endContainer);
    }
    cleanEmptyNodes(dom, startParent, isRoot);
    if (startParent !== endParent) {
      cleanEmptyNodes(dom, endParent, isRoot);
    }
  }
};

const getParentBlock = (editor: Editor, rng: Range): Optional<Element> => {
  const parentBlockOpt = Optional.from(editor.dom.getParent(rng.startContainer, editor.dom.isBlock));
  if (Options.getForcedRootBlock(editor) === '') {
    return parentBlockOpt.orThunk(() => Optional.some(editor.getBody()));
  } else {
    return parentBlockOpt;
  }
};

export {
  cleanEmptyNodes,
  deleteRng,
  getParentBlock
};
