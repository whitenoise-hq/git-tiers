/** 번역 문구의 {name} 자리에 값을 넣는다. 없는 값은 그대로 둔다. */
export const formatMessage = (
  template: string,
  values: Readonly<Record<string, string | number>>
): string =>
  template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match
  );
