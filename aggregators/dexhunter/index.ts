import fetchURL, { postURL } from "../../utils/fetchURL"
import { FetchResult, SimpleAdapter } from "../../adapters/types";
import { CHAIN } from "../../helpers/chains";
import { getUniqStartOfTodayTimestamp } from "../../helpers/getUniSubgraphVolume";

const URL = 'https://api.dexhunter.app';
const endpoint = '/stats';
const startTimestamp = 1684108800; // 15.10.2023

interface IAPIResponse {
  is_dexhunter: boolean;
  usd_volume: number;
}

const fetchData = async (period: '24h' | 'all'): Promise<string> => {
  const response = await postURL(`${URL}${endpoint}`, { period });
  const data: IAPIResponse[] = response.data;

  const dexhunterData = data.find(d => d.is_dexhunter);
  if (!dexhunterData) {
    throw new Error('No dexhunter data found');
  }

  return dexhunterData.usd_volume.toString()
}

const fetch = async (): Promise<FetchResult> => {
  const dailyVolume = await fetchData('24h');
  const totalVolume = await fetchData('all');
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date());

  return {
    dailyVolume,
    totalVolume,
    timestamp: dayTimestamp,
  };
}

const adapter: SimpleAdapter = {
  adapter: {
    [CHAIN.CARDADO]: {
      fetch,
      start: async () => startTimestamp,
    },
  },
};

export default adapter;