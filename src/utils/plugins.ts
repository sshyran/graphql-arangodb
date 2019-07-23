import { FIELD_PARAM_PREFIX } from '../constants';

export const createFieldArgGetter = (fieldName: string) => (
  argPath: string
) => {
  return argPath.replace('$args.', `@${FIELD_PARAM_PREFIX}${fieldName}.args.`);
};

/**
 * Creates a function which replaces all "$arg.foo.bar" with the real
 * argument string
 */
export const createArgReplacer = (argGetter: (name: string) => any) => (
  str: string
) => {
  const argMatcher = /\$args(\.\w[\w\d]+)*/;
  let result;
  let modifiedStr = '' + str;

  while ((result = argMatcher.exec(modifiedStr)) !== null) {
    const text = result[0];
    const index = result.index;
    modifiedStr = spliceString(modifiedStr, index, text, argGetter(text));
  }

  return modifiedStr;
};

/**
 * Creates a function which replaces all "$field" with the actual field name
 */
const createFieldReplacer = (fieldName: string) => (text: string) =>
  replaceAll(text, '$field', fieldName);
const createParentReplacer = (parentName: string) => (text: string) =>
  replaceAll(text, '$parent', parentName);
const createContextReplacer = () => (text: string) =>
  replaceAll(text, '$context', '@context');

const replaceAll = (
  text: string,
  original: string,
  replacement: string
): string => {
  let modifiedText = '' + text;
  let index;
  while ((index = modifiedText.indexOf(original)) >= 0) {
    modifiedText = spliceString(modifiedText, index, original, replacement);
  }
  return modifiedText;
};

const spliceString = (
  text: string,
  index: number,
  original: string,
  replacement: string
) => {
  return (
    text.slice(0, index) + replacement + text.slice(index + original.length)
  );
};

export const createAllReplacer = ({
  fieldName,
  parentName,
}: {
  fieldName: string;
  parentName: string;
}) => {
  const argReplacer = createArgReplacer(createFieldArgGetter(fieldName));
  const fieldReplacer = createFieldReplacer(fieldName);
  const parentReplacer = createParentReplacer(parentName);
  const contextReplacer = createContextReplacer();

  return (text: string): string =>
    contextReplacer(parentReplacer(fieldReplacer(argReplacer(text))));
};