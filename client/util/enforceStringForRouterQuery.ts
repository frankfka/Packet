const enforceStringForRouterQuery = (val?: string | string[]): string => {
  return typeof val === 'string' ? val : '';
};
export default enforceStringForRouterQuery;
