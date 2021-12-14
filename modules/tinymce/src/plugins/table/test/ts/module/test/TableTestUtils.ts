import { ApproxStructure, Assertions, Cursors, Mouse, StructAssert, UiFinder, Waiter } from '@ephox/agar';
import { Arr, Obj } from '@ephox/katamari';
import { Attribute, Checked, Class, SelectorFind, SugarBody, Value } from '@ephox/sugar';
import { TinyDom, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

interface Options {
  readonly headerRows: number;
  readonly headerCols: number;
}

export interface WidthData {
  readonly raw: number | null;
  readonly px: number;
  readonly unit: string | null;
  readonly isPercent: boolean;
}

const advSelectors = {
  borderstyle: 'label.tox-label:contains(Border style) + div.tox-listboxfield > .tox-listbox',
  bordercolor: 'label.tox-label:contains(Border color) + div>input.tox-textfield',
  backgroundcolor: 'label.tox-label:contains(Background color) + div>input.tox-textfield'
};

const getRawWidth = (editor: Editor, elm: HTMLElement): string => {
  const style = editor.dom.getStyle(elm, 'width');
  if (style) {
    return style;
  } else {
    const attr = editor.dom.getAttrib(elm, 'width');
    return attr ? attr + 'px' : attr;
  }
};

const getWidths = (editor: Editor, elm: HTMLElement): WidthData => {
  const rawWidth = getRawWidth(editor, elm);
  const pxWidth = editor.dom.getStyle(elm, 'width', true);
  const unit = rawWidth === '' ? null : /\d+(\.\d+)?(%|px)/.exec(rawWidth)[2];
  return {
    raw: rawWidth === '' ? null : parseFloat(rawWidth),
    px: parseInt(pxWidth, 10),
    unit,
    isPercent: unit === '%'
  };
};

const assertWidth = (editor: Editor, elm: HTMLElement, expectedWidth: number | null, expectedUnit: string | null): void => {
  const widthData = getWidths(editor, elm);
  const nodeName = elm.nodeName.toLowerCase();
  if (expectedWidth === null) {
    assert.isNull(widthData.raw, `${nodeName} width should not be set`);
  } else {
    assert.approximately(widthData.raw, expectedWidth, 2, `${nodeName} width is ${expectedWidth} ~= ${widthData.raw}`);
  }
  assert.equal(widthData.unit, expectedUnit, `${nodeName} unit is ${expectedUnit}`);
};

const assertTableStructure = (editor: Editor, structure: StructAssert): void => {
  const table = SelectorFind.descendant(TinyDom.body(editor), 'table').getOrDie('A table should exist');
  Assertions.assertStructure('Should be a table the expected structure', structure, table);
};

const openContextToolbarOn = (editor: Editor, selector: string, path: number[]): void => {
  const elem = UiFinder.findIn(TinyDom.body(editor), selector).getOrDie();
  const target = Cursors.follow(elem, path).getOrDie();
  editor.selection.select(target.dom);
  Mouse.click(target);
};

const pOpenTableDialog = async (editor: Editor): Promise<void> => {
  await Waiter.pTryUntil('Click table properties toolbar button',
    () => TinyUiActions.clickOnToolbar(editor, 'button:not(.tox-tbtn--disabled)')
  );
  await TinyUiActions.pWaitForDialog(editor);
};

const assertApproxElementStructure = (editor: Editor, selector: string, expected: StructAssert): void => {
  const body = editor.getBody();
  body.normalize(); // consolidate text nodes
  const target = SelectorFind.descendant(TinyDom.body(editor), selector).getOrDie('Nothing in the editor matches selector: ' + selector);

  Assertions.assertStructure(
    'Asserting HTML structure of the element: ' + selector,
    expected,
    target
  );
};

const assertElementStructure = (editor: Editor, selector: string, expected: string): void =>
  assertApproxElementStructure(editor, selector, ApproxStructure.fromHtml(expected));

const pClickDialogButton = async (editor: Editor, isSave: boolean): Promise<void> => {
  const close = isSave ? TinyUiActions.submitDialog : TinyUiActions.cancelDialog;
  close(editor);
  await Waiter.pTryUntil(
    'Waiting for the dialog to go away',
    () => UiFinder.notExists(SugarBody.body(), '.tox-dialog')
  );
};

const pAssertDialogPresence = async (label: string, editor: Editor, expected: Record<string, number>): Promise<void> => {
  const dialog = await TinyUiActions.pWaitForDialog(editor);
  Assertions.assertPresence(
    label,
    expected,
    dialog
  );
};

const pAssertListBoxValue = async (label: string, editor: Editor, section: string, expected: string): Promise<void> => {
  const dialog = await TinyUiActions.pWaitForDialog(editor);
  const elem = UiFinder.findIn(dialog, 'label:contains("' + section + '") + .tox-listboxfield > .tox-listbox').getOrDie();
  const value = Attribute.get(elem, 'data-value');
  assert.equal(value, expected, 'Checking listbox: ' + label);
};

const getInput = (selector: string) =>
  UiFinder.findIn<HTMLInputElement>(SugarBody.body(), selector).getOrDie();

const assertInputValue = (label: string, selector: string, expected: string | boolean): void => {
  const input = getInput(selector);
  if (input.dom.type === 'checkbox') {
    assert.equal(input.dom.checked, expected, `The input value for ${label} should be: ${expected}`);
  } else if (Class.has(input, 'tox-listbox')) {
    assert.equal(Attribute.get(input, 'data-value'), expected, `The input value for ${label} should be: ${expected}`);
  } else {
    assert.equal(Value.get(input), expected, `The input value for ${label} should be: ${expected}`);
  }
};

const setInputValue = (selector: string, value: string | boolean): void => {
  const input = getInput(selector);
  if (input.dom.type === 'checkbox') {
    Checked.set(input, value as boolean);
  } else if (Class.has(input, 'tox-listbox')) {
    Attribute.set(input, 'data-value', value);
  } else {
    Value.set(input, value as string);
  }
};

const gotoGeneralTab = () => Mouse.clickOn(SugarBody.body(), 'div.tox-tab:contains(General)');
const gotoAdvancedTab = () => Mouse.clickOn(SugarBody.body(), 'div.tox-tab:contains(Advanced)');

const setTabInputValues = (data: Record<string, any>, tabSelectors: Record<string, string>): void => {
  Obj.mapToArray(tabSelectors, (value, key) => {
    if (Obj.has(data, key)) {
      setInputValue(tabSelectors[key], data[key]);
    }
  });
};

const setDialogValues = (data: Record<string, any>, hasAdvanced: boolean, generalSelectors: Record<string, string>): void => {
  if (hasAdvanced) {
    gotoGeneralTab();
    setTabInputValues(data, generalSelectors);
    gotoAdvancedTab();
    setTabInputValues(data, advSelectors);
  } else {
    setTabInputValues(data, generalSelectors);
  }
};

const assertTabContents = (data: Record<string, any>, tabSelectors: Record<string, string>): void => {
  Obj.mapToArray(tabSelectors, (value, key) => {
    if (Obj.has(data, key)) {
      assertInputValue(key, value, data[key]);
    }
  });
};

const assertDialogValues = (data: Record<string, any>, hasAdvanced: boolean, generalSelectors: Record<string, string>): void => {
  if (hasAdvanced) {
    gotoGeneralTab();
    assertTabContents(data, generalSelectors);
    gotoAdvancedTab();
    assertTabContents(data, advSelectors);
  } else {
    assertTabContents(data, generalSelectors);
  }
};

const assertTableStructureWithSizes = (
  editor: Editor,
  cols: number,
  rows: number,
  unit: string | null,
  tableWidth: number | null,
  widths: Array<number | null>[],
  useColGroups: boolean,
  options: Options = { headerRows: 0, headerCols: 0 }
): void => {
  const tableWithColGroup = () => {
    const table = editor.dom.select('table')[0];
    assertWidth(editor, table, tableWidth, unit);
    const row = editor.dom.select('colgroup', table)[0];
    Arr.each(widths[0], (columnWidth, columnIndex) => {
      const column = editor.dom.select('col', row)[columnIndex];
      assertWidth(editor, column, columnWidth, unit);
    });
  };

  const tableWithoutColGroup = () => {
    const table = editor.dom.select('table')[0];
    assertWidth(editor, table, tableWidth, unit);
    Arr.each(widths, (rowWidths, rowIndex) => {
      const row = editor.dom.select('tr', table)[rowIndex];
      Arr.each(rowWidths, (cellWidth, cellIndex) => {
        const cell = editor.dom.select('td,th', row)[cellIndex];
        assertWidth(editor, cell, cellWidth, unit);
      });
    });
  };

  const structure = () => assertTableStructure(editor, ApproxStructure.build((s, str) => {
    const tbody = s.element('tbody', {
      children: Arr.range(rows, (rowIndex) =>
        s.element('tr', {
          children: Arr.range(cols, (colIndex) =>
            s.element(colIndex < options.headerCols || rowIndex < options.headerRows ? 'th' : 'td', {
              children: [
                s.either([
                  s.element('br', { }),
                  s.text(str.contains('Cell'))
                ])
              ]
            })
          )
        })
      )
    });

    const colGroup = s.element('colgroup', {
      children: Arr.range(cols, () =>
        s.element('col', {})
      )
    });

    return s.element('table', {
      attrs: { border: str.is('1') },
      styles: { 'border-collapse': str.is('collapse') },
      children: useColGroups ? [ colGroup, tbody ] : [ tbody ]
    });
  }));

  if (useColGroups) {
    structure();
    tableWithColGroup();
  } else {
    structure();
    tableWithoutColGroup();
  }
};

const pInsertTableViaGrid = async (editor: Editor, cols: number, rows: number) => {
  TinyUiActions.clickOnMenu(editor, 'span:contains("Table")');
  await Waiter.pTryUntil('click table menu', () =>
    TinyUiActions.clickOnUi(editor, 'div.tox-menu div.tox-collection__item .tox-collection__item-label:contains("Table")')
  );
  const gridSelector = (cols - 1) + (10 * (rows - 1));
  await Waiter.pTryUntil('click table grid', () =>
    TinyUiActions.clickOnUi(editor, `div.tox-insert-table-picker div[role="button"]:nth(${gridSelector})`)
  );
};

const createTableChildren = (s: ApproxStructure.StructApi, str: ApproxStructure.StringApi, withColGroups: boolean): StructAssert[] => {
  const style = {
    width: str.contains('%')
  };

  const styleNone = {
    width: str.none()
  };

  const columns = s.element('colgroup', {
    children: [
      s.element('col', {
        styles: style
      }),
      s.element('col', {
        styles: style
      })
    ]
  });

  const tbody = s.element('tbody', {
    children: [
      s.element('tr', {
        children: [
          s.element('td', {
            styles: withColGroups ? styleNone : style,
            children: [
              s.element('br', {})
            ]
          }),
          s.element('td', {
            styles: withColGroups ? styleNone : style,
            children: [
              s.element('br', {})
            ]
          })
        ]
      }),
      s.element('tr', {
        children: [
          s.element('td', {
            styles: withColGroups ? styleNone : style,
            children: [
              s.element('br', {})
            ]
          }),
          s.element('td', {
            styles: withColGroups ? styleNone : style,
            children: [
              s.element('br', {})
            ]
          })
        ]
      })
    ]
  });

  return withColGroups ? [ columns, tbody ] : [ tbody ];
};

export {
  pAssertDialogPresence,
  pAssertListBoxValue,
  openContextToolbarOn,
  assertTableStructure,
  assertTableStructureWithSizes,
  createTableChildren,
  pInsertTableViaGrid,
  pOpenTableDialog,
  gotoGeneralTab,
  gotoAdvancedTab,
  assertInputValue,
  assertDialogValues,
  setInputValue,
  setDialogValues,
  pClickDialogButton,
  assertElementStructure,
  assertApproxElementStructure
};
