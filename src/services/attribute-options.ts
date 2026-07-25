import axiosInstance from './axios-config';

// Fetches every admin-managed option list (brand, chassi, floor, education,
// contractType, ...) in one request and groups it by groupKey, instead of a
// separate network round-trip per field/type — see
// AttributeOptionsSyncBridge, which calls this once at app launch (and only
// again if getAttributeOptionsVersion() has moved) rather than every time an
// OptionPicker bottom sheet is opened.
export const getAllAttributeOptionsGrouped = (): Promise<
  Record<string, {title: string}[]>
> => {
  return axiosInstance.get('/attribute-options').then(res => {
    const grouped: Record<string, {title: string}[]> = {};
    for (const option of res.data) {
      const list = grouped[option.groupKey] || (grouped[option.groupKey] = []);
      list.push({title: option.label});
    }
    return grouped;
  });
};

export const getAttributeOptionsVersion = (): Promise<number> => {
  return axiosInstance
    .get('/attribute-options/version')
    .then(res => res.data.version);
};
