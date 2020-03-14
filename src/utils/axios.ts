import axios from "axios";
import _ from "lodash";

export async function runAxiosBatch<O, T>(
  url: string,
  params: O[],
  { batchSize = 100 }: { batchSize?: number }
) {
  const batchedParams = _.chunk(params, batchSize);
  const batchResults: T[] = [];
  for (let batchedParam of batchedParams) {
    let batchResult = await Promise.all(
      batchedParam.map(param => axios.get<T>(url, { params: param }))
    );
    batchResults.push(..._.flatten(batchResult.map(result => result.data)));
  }
  return batchResults;
}
