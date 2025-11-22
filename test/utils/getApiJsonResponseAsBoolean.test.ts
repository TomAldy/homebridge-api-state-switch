import { getApiJsonResponseAsBoolean } from '../../src/utils/getApiJsonResponseAsBoolean.js';

describe('getJsonValue (boolean JSON path resolver)', () => {
  const sample = {
    state: {
      power: {
        value: true,
        label: 'ON',
      },
      temperature: 0,
      mode: 'auto',
    },
    meta: {
      device: {
        id: 'abc-123',
        active: false,
      },
    },
  };

  it('returns true when the resolved value is true', () => {
    expect(getApiJsonResponseAsBoolean(sample, 'state.power.value')).toBe(true);
  });

  it('returns false when resolving a property that exists but is false', () => {
    expect(getApiJsonResponseAsBoolean(sample, 'meta.device.active')).toBe(false);
  });

  it('returns false for numeric zero values', () => {
    expect(getApiJsonResponseAsBoolean(sample, 'state.temperature')).toBe(false);
  });

  it('returns true for non-empty strings', () => {
    expect(getApiJsonResponseAsBoolean(sample, 'state.power.label')).toBe(true);
  });

  it('returns false for empty strings', () => {
    const obj = { foo: { bar: '' } };
    expect(getApiJsonResponseAsBoolean(obj, 'foo.bar')).toBe(false);
  });

  it('returns false for null values', () => {
    const obj = { foo: { bar: null } };
    expect(getApiJsonResponseAsBoolean(obj, 'foo.bar')).toBe(false);
  });

  it('returns false when the path does not exist', () => {
    expect(getApiJsonResponseAsBoolean(sample, 'does.not.exist')).toBe(false);
  });

  it('returns false when any intermediate path is missing', () => {
    expect(getApiJsonResponseAsBoolean(sample, 'state.power.missingNode')).toBe(false);
  });

  it('returns false when the root object is null', () => {
    expect(getApiJsonResponseAsBoolean(null as unknown, 'state.power.value')).toBe(false);
  });

  it('returns false for an empty path', () => {
    expect(getApiJsonResponseAsBoolean(sample, '')).toBe(false);
  });
});