// Copyright 2024 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

jest.mock('../../src/config', () => ({
  CONFIG: { resultNamespace: 'RESULT' },
  GLOBALCTX: {},
}));

jest.mock('../../src/helpers/dynamic-column-headers', () => {
  return {
    DynamicColumnHeaders: jest.fn().mockImplementation(() => {
      return {
        getMappedValues: jest.fn().mockReturnValue({ param1: 'val1' }),
      };
    }),
  };
});

jest.mock('../../src/helpers/jpath', () => ({
  JPath: { getValue: jest.fn().mockReturnValue('mocked_jpath_value') },
}));

jest.mock('../../src/helpers/sheets', () => ({
  SheetsService: { getInstance: jest.fn() },
}));
jest.mock('../../src/helpers/api', () => ({ ApiHelper: jest.fn() }));

import { GLOBALCTX } from '../../src/config';
import { DynamicColumnHeaders } from '../../src/helpers/dynamic-column-headers';

const targetFilePath = path.resolve(__dirname, '../../src/index.ts');
const targetDir = path.dirname(targetFilePath);
const sourceCode = fs.readFileSync(targetFilePath, 'utf8');

const testableSource =
  sourceCode + `\nmodule.exports = { updateRowWithResultData };\n`;

const transpiled = ts.transpileModule(testableSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;

const customRequire = (moduleId: string) => {
  if (moduleId.startsWith('.')) {
    return require(path.resolve(targetDir, moduleId));
  }
  return require(moduleId);
};

const customModule = { exports: {} as any };
const wrapper = new Function(
  'exports',
  'require',
  'module',
  '__filename',
  '__dirname',
  transpiled
);
wrapper(
  customModule.exports,
  customRequire,
  customModule,
  targetFilePath,
  targetDir
);

const { updateRowWithResultData } = customModule.exports;

describe('updateRowWithResultData - !CUSTOM Function Execution', () => {
  const mockData = { id: 123, status: 'ok' };
  const group = '';

  beforeEach(() => {
    if (GLOBALCTX) {
      Object.keys(GLOBALCTX).forEach(key => delete (GLOBALCTX as any)[key]);
    }
    (DynamicColumnHeaders as any).namespaceSeparator = '::';
  });

  it('1. should throw an error when attempting to call blocked globals', () => {
    const forbiddenGlobals = [
      'eval',
      'Function',
      'setTimeout',
      'setInterval',
      'execute',
      'UrlFetchApp',
      'ScriptApp',
      'DriveApp',
      'SpreadsheetApp',
      'PropertiesService',
      'CacheService',
      'Utilities',
      'OAuth2',
      'Logger',
      'console',
    ];

    forbiddenGlobals.forEach(funcName => {
      const headers = [`RESULT::!CUSTOM.${funcName}`];
      const row = ['initial_value'];

      expect(() => {
        updateRowWithResultData(headers, row, mockData, group);
      }).toThrow(
        `!CUSTOM function '${funcName}' is not an allowed user-defined function`
      );
    });
  });

  it('2. should throw an error if the property is undefined or not a function', () => {
    const testCases = [
      { name: 'undefinedFunc', value: undefined },
      { name: 'stringVar', value: 'I am a string, not a function' },
      { name: 'numberVar', value: 42 },
      { name: 'objectVar', value: { key: 'value' } },
    ];

    testCases.forEach(testCase => {
      if (GLOBALCTX) {
        (GLOBALCTX as any)[testCase.name] = testCase.value;
      }

      const headers = [`RESULT::!CUSTOM.${testCase.name}`];
      const row = ['initial_value'];

      expect(() => {
        updateRowWithResultData(headers, row, mockData, group);
      }).toThrow(
        `!CUSTOM function '${testCase.name}' is not an allowed user-defined function`
      );
    });
  });

  it('3. should execute legitimate user-defined custom functions and return expected values', () => {
    const validFuncName = 'myValidCustomFormatter';
    const expectedReturnValue = 'successfully_formatted_value';

    if (GLOBALCTX) {
      (GLOBALCTX as any)[validFuncName] = jest.fn((data, customParams) => {
        return expectedReturnValue;
      });
    }

    const headers = [`RESULT::!CUSTOM.${validFuncName}`];
    const row = ['initial_value'];

    const updatedRow = updateRowWithResultData(headers, row, mockData, group);

    expect((GLOBALCTX as any)[validFuncName]).toHaveBeenCalledTimes(1);
    expect((GLOBALCTX as any)[validFuncName]).toHaveBeenCalledWith(mockData, {
      param1: 'val1',
    });
    expect(updatedRow[0]).toBe(expectedReturnValue);
  });
});
