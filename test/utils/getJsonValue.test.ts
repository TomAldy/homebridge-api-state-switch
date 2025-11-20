import { getJsonValue } from '../../src/utils/getJsonValue.js';

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
    expect(getJsonValue(sample, 'state.power.value')).toBe(true);
  });

  it('returns false when resolving a property that exists but is false', () => {
    expect(getJsonValue(sample, 'meta.device.active')).toBe(false);
  });

  it('returns false for numeric zero values', () => {
    expect(getJsonValue(sample, 'state.temperature')).toBe(false);
  });

  it('returns true for non-empty strings', () => {
    expect(getJsonValue(sample, 'state.power.label')).toBe(true);
  });

  it('returns false for empty strings', () => {
    const obj = { foo: { bar: '' } };
    expect(getJsonValue(obj, 'foo.bar')).toBe(false);
  });

  it('returns false for null values', () => {
    const obj = { foo: { bar: null } };
    expect(getJsonValue(obj, 'foo.bar')).toBe(false);
  });

  it('returns false when the path does not exist', () => {
    expect(getJsonValue(sample, 'does.not.exist')).toBe(false);
  });

  it('returns false when any intermediate path is missing', () => {
    expect(getJsonValue(sample, 'state.power.missingNode')).toBe(false);
  });

  it('returns false when the root object is null', () => {
    expect(getJsonValue(null as unknown, 'state.power.value')).toBe(false);
  });

  it('returns false for an empty path', () => {
    expect(getJsonValue(sample, '')).toBe(false);
  });
});