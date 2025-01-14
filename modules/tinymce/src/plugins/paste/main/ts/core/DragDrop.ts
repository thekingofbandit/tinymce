/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';

import RangeUtils from 'tinymce/core/api/dom/RangeUtils';
import Editor from 'tinymce/core/api/Editor';
import Delay from 'tinymce/core/api/util/Delay';

import { Clipboard } from '../api/Clipboard';
import * as Options from '../api/Options';
import { ClipboardContents } from './Clipboard';
import * as InternalHtml from './InternalHtml';
import * as Utils from './Utils';

const getCaretRangeFromEvent = (editor: Editor, e: MouseEvent): Range | undefined =>
  RangeUtils.getCaretRangeFromPoint(e.clientX, e.clientY, editor.getDoc());

const isPlainTextFileUrl = (content: ClipboardContents): boolean => {
  const plainTextContent = content['text/plain'];
  return plainTextContent ? plainTextContent.indexOf('file://') === 0 : false;
};

const setFocusedRange = (editor: Editor, rng: Range): void => {
  editor.focus();
  editor.selection.setRng(rng);
};

const setup = (editor: Editor, clipboard: Clipboard, draggingInternallyState: Cell<boolean>): void => {
  // Block all drag/drop events
  if (Options.shouldBlockDrop(editor)) {
    editor.on('dragend dragover draggesture dragdrop drop drag', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  }

  // Prevent users from dropping data images on Gecko
  if (!Options.shouldPasteDataImages(editor)) {
    editor.on('drop', (e) => {
      const dataTransfer = e.dataTransfer;

      if (dataTransfer && dataTransfer.files && dataTransfer.files.length > 0) {
        e.preventDefault();
      }
    });
  }

  editor.on('drop', (e) => {
    const rng = getCaretRangeFromEvent(editor, e);

    if (e.isDefaultPrevented() || draggingInternallyState.get()) {
      return;
    }

    const dropContent = clipboard.getDataTransferItems(e.dataTransfer);
    const internal = clipboard.hasContentType(dropContent, InternalHtml.internalHtmlMime());

    if ((!clipboard.hasHtmlOrText(dropContent) || isPlainTextFileUrl(dropContent)) && clipboard.pasteImageData(e, rng)) {
      return;
    }

    if (rng && Options.shouldFilterDrop(editor)) {
      let content = dropContent['mce-internal'] || dropContent['text/html'] || dropContent['text/plain'];

      if (content) {
        e.preventDefault();

        // FF 45 doesn't paint a caret when dragging in text in due to focus call by execCommand
        Delay.setEditorTimeout(editor, () => {
          editor.undoManager.transact(() => {
            if (dropContent['mce-internal']) {
              editor.execCommand('Delete');
            }

            setFocusedRange(editor, rng);

            content = Utils.trimHtml(content);

            if (!dropContent['text/html']) {
              clipboard.pasteText(content);
            } else {
              clipboard.pasteHtml(content, internal);
            }
          });
        });
      }
    }
  });

  editor.on('dragstart', (_e) => {
    draggingInternallyState.set(true);
  });

  editor.on('dragover dragend', (e) => {
    if (Options.shouldPasteDataImages(editor) && draggingInternallyState.get() === false) {
      e.preventDefault();
      setFocusedRange(editor, getCaretRangeFromEvent(editor, e));
    }

    if (e.type === 'dragend') {
      draggingInternallyState.set(false);
    }
  });
};

export {
  setup
};
